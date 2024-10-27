import { ReferenceConfig } from "../../ReferenceConfig";
import { NoomiRpcStarter } from "../../NoomiRpcStarter";
import { Constructor } from "../utils/TypesUtil";

/**
 * 代理选项
 */
interface ReferenceOption {
  /**
   * 服务提供接口
   */
  interfaceProvider: Constructor;

  /**
   * 服务前缀
   */
  servicePrefix?: string;
}

/**
 * 代理装饰器，装饰属性
 * @constructor
 */
export function NoomiReference<T>(
  referenceOption: ReferenceOption
): (target: NonNullable<unknown>, propertyKey: string | symbol) => void {
  return async (target: NonNullable<unknown>, propertyKey: string | symbol): Promise<void> => {
    const reference: ReferenceConfig<T> = new ReferenceConfig<T>();
    reference.interfaceRef = referenceOption.interfaceProvider;
    if (referenceOption.servicePrefix) {
      reference.servicePrefix = referenceOption.servicePrefix;
    }
    NoomiRpcStarter.getInstance().reference(reference).then();
    Object.defineProperty(target, propertyKey, {
      get: () => reference.get(),
      enumerable: true,
      configurable: true
    });
  };
}
