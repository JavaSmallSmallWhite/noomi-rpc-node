import { ReferenceConfig } from "../../ReferenceConfig";
import { NoomiRpcStarter } from "../../NoomiRpcStarter";
import { Constructor } from "../utils/TypesUtil";
import { InterfaceUtil } from "../utils/InterfaceUtil";
import { GlobalCache } from "../../cache/GlobalCache";

/**
 * 代理选项
 */
interface ReferenceOption {
  /**
   * 接口名称
   */
  interfaceName?: string;

  /**
   * 接口与文件名称
   */
  interfaceFileName?: string;

  /**
   * 服务名称
   */
  serviceName: string;

  /**
   * Fury描述类
   */
  description?: Constructor;

  /**
   * proto文件路径
   */
  protoFile?: string;

  /**
   * proto服务名称
   */
  protoServiceName?: string;
}

/**
 * 代理装饰器，装饰属性
 * @constructor
 */
export function NoomiReference<T>(
  referenceOption: ReferenceOption
): (target: NonNullable<unknown>, propertyKey: string | symbol) => void {
  return async (target: NonNullable<unknown>, propertyKey: string | symbol): Promise<void> => {
    let reference: ReferenceConfig<T> = <ReferenceConfig<T>>(
      GlobalCache.REFERENCES_LIST.get(referenceOption.serviceName)
    );
    if (!reference) {
      reference = new ReferenceConfig<T>();
      const { interfaceName, interfaceFileName } = referenceOption;
      reference.interfaceRef = InterfaceUtil.genInterfaceClass(interfaceFileName, interfaceName);
      reference.serviceName = referenceOption.serviceName;
      reference.descriptionClass = referenceOption.description || null;
    }
    NoomiRpcStarter.getInstance().reference(reference).then();
    Object.defineProperty(target, propertyKey, {
      get: () => reference.get(),
      enumerable: true,
      configurable: true
    });
  };
}
