import { BaseService } from "../../BaseService";

/**
 * 数据模型装饰器，装饰类
 * @param clazz - 模型类
 */
export function DataModel(clazz: unknown) {
  return (target: BaseService) => {
    target.__modelClass = clazz;
  };
}
