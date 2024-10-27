import { WebAfterHandler } from "../../webafter/WebAfterHandler";

/**
 * web后置处理器，装饰方法
 * @param pattern - 过滤正则表达式或表达式数组，默认为 .*，处理所有请求
 * @param order -   优先级，值越小优先级越高，默认10000，可选
 */
export function WebHandler(pattern?: RegExp | Array<RegExp>, order?: number) {
  return (target: unknown, name: string) => {
    if (!Array.isArray(pattern)) {
      pattern = [pattern];
    }
    WebAfterHandler.addHandler({
      clazz: target.constructor,
      method: name,
      patterns: pattern,
      order: order
    });
  };
}
