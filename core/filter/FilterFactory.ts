import { InstanceFactory } from "noomi";
import { FilterOption } from "../common/utils/TypesUtil";
import { RequestPayload } from "../message/RequestPayload";
import { ResponsePayload } from "../message/ResponsePayload";

/**
 * 过滤器工厂类
 * 用于管理定义的过滤器
 */
export class FilterFactory {
  /**
   * 过滤器实例数组
   */
  private static filters: Array<FilterOption> = [];

  /**
   * 处理实例过滤器
   * @param cfg - filter配置项
   */
  public static addFilter(cfg: FilterOption): void {
    //如果类未添加到实例工厂，则添加
    if (!InstanceFactory.hasClass(cfg.clazz)) {
      InstanceFactory.addInstance(cfg.clazz, {
        singleton: true
      });
    }
    cfg.order = cfg.order || 10000;
    if (!Array.isArray(cfg.patterns)) {
      cfg.patterns = [cfg.patterns];
    }
    // 加入过滤器集合
    this.filters.push(cfg);
    // 排序
    this.filters.sort((a, b) => {
      return a.order - b.order;
    });
  }

  /**
   * 获取过滤器链
   * @param url - 资源url
   * @returns     filter数组
   */
  public static getFilterChain(url: string): Array<FilterOption> {
    const arr: Array<FilterOption> = [];
    this.filters.forEach((item: FilterOption) => {
      let reg: RegExp;
      for (reg of item.patterns) {
        // 找到匹配
        if (reg.test(url)) {
          arr.push(item);
          return;
        }
      }
    });
    return arr;
  }

  /**
   * 执行过滤器链
   * @param url -     url路径
   * @param requestPayload - payload noomi-rpc请求体
   * @param responseBody 响应体
   * @returns         全部执行完为true，否则为false
   */
  public static async doChain(
    url: string,
    requestPayload: RequestPayload,
    responseBody: ResponsePayload
  ): Promise<boolean> {
    const arr: Array<FilterOption> = FilterFactory.getFilterChain(url);
    if (arr.length === 0) {
      return true;
    }
    for (const item of arr) {
      const ins = InstanceFactory.getInstance(item.clazz);
      if (!ins) {
        continue;
      }
      if (typeof ins[item.method] === "function") {
        //如果返回false，表示后续过滤器方法不再执行
        if (!(await InstanceFactory.exec(ins, item.method, [requestPayload, responseBody]))) {
          return false;
        }
      }
    }
    return true;
  }
}
