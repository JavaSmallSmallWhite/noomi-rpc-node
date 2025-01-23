import { ModelManager } from "../../model/ModelManager";

/**
 * 数据null检查，装饰路由方法
 * @param props -     待检查属性数组
 */
export function NullCheck(props: Array<string>) {
  return (target: unknown, name: string) => {
    ModelManager.setNullCheck(target.constructor.name, name, props);
  };
}
