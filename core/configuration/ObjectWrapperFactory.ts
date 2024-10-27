import { ObjectWrapperType } from "./ObjectWrapperType";

/**
 * wrapper配置工厂
 */
export class ObjectWrapperFactory {
  /**
   * Wrapper缓存器，用于存储序列化器、压缩器负载均衡器之类的配置
   * @private
   */
  private static OBJECT_WRAPPER_CONFIG_CACHE: Map<string, ObjectWrapperType> = new Map<
    string,
    ObjectWrapperType
  >();

  /**
   * 添加wrapper配置
   * @param name wrapper名称
   * @param config wrapper配置
   */
  public static addObjectWrapperConfig(name: string, config: ObjectWrapperType): void {
    if (this.OBJECT_WRAPPER_CONFIG_CACHE.has(name)) {
      throw new Error(`${name}的配置已存在。`);
    }
    this.OBJECT_WRAPPER_CONFIG_CACHE.set(name, config);
  }

  /**
   * 获取wrapper配置
   * @param name wrapper名称
   */
  public static getObjectWrapperConfig(name: string): ObjectWrapperType {
    if (!this.OBJECT_WRAPPER_CONFIG_CACHE.has(name)) {
      throw new Error(`${name}的配置不存在。`);
    }
    return this.OBJECT_WRAPPER_CONFIG_CACHE.get(name);
  }
}
