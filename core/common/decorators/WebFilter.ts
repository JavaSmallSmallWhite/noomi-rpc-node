import { FilterFactory } from "../../filter/FilterFactory";

/**
 * web过滤器，装饰方法
 * @param pattern - RegExp|Array<RegExp>  过滤正则表达式或表达式数组，默认为 .*，过滤所有请求
 * @param order -   number                优先级，值越小优先级越高，默认10000，可选
 */
export function WebFilter(pattern?: RegExp | RegExp[], order?: number) {
  return (target: unknown, name: string) => {
    if (!Array.isArray(pattern)) {
      pattern = [pattern];
    }
    FilterFactory.addFilter({
      clazz: target.constructor,
      method: name,
      patterns: pattern,
      order: order
    });
  };
}
