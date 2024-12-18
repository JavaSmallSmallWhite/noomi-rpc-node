import { NoomiRpcRequest } from "./message/NoomiRpcRequest";
import { NoomiRpcResponse } from "./message/NoomiRpcResponse";
import { ModelManager } from "./model/ModelManager";

/**
 * 服务基类
 * 建议所有服务继承此基类
 */
export class BaseService {
  /**
   * 模型类
   */
  public __modelClass: unknown;
  /**
   * 数据对象
   */
  public model: any;
  /**
   * request对象
   */
  public request: NoomiRpcRequest;
  /**
   * response对象
   */
  public response: NoomiRpcResponse;

  /**
   * model设置
   * @remarks
   * 操作包含：
   *
   * 1. 数据类型转换
   *
   * 2. 数据校验
   *
   * 如果类型转换或数据校验未通过，抛出异常
   * @param data -        数据对象(由浏览器/客户端传入的数据参数)
   * @param methodName -  路由方法名
   * @throws              抛出数据转换或校验异常对象信息
   */
  public setModel(data: object, methodName?: string) {
    const mCls = this.constructor["__modelClass"];
    if (mCls) {
      //实例化model
      const m = Reflect.construct(mCls, []);
      // model属性赋值
      Object.getOwnPropertyNames(data).forEach((item) => {
        m[item] = data[item];
      });
      const r = ModelManager.handle(this, methodName, m);
      if (r) {
        throw r;
      }
      this.model = m;
    } else {
      this.model = data;
    }
  }

  /**
   * 设置request对象
   * @param req -   request对象
   */
  public setRequest(req: NoomiRpcRequest): void {
    this.request = req;
  }

  /**
   * 设置response对象
   * @param res -   response对象
   */
  public setResponse(res: NoomiRpcResponse): void {
    this.response = res;
  }
}
