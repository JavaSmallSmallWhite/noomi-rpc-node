import { Logger } from "../common/logger/Logger";
import { NoomiRpcConsumerHandler } from "./handler/NoomiRpcConsumerHandler";
import { InterfaceUtil } from "../common/utils/InterfaceUtil";

/**
 *  接口的代理
 */
export class InterfaceMethodProxy<T extends NonNullable<unknown>> {
  /**
   * 为接口对象创建代理
   * @param interfaceObject 接口对象
   * @param serviceName 服务名称
   */
  public createProxyForInterface(interfaceObject: T, serviceName: string): T {
    const interfaceName: string = InterfaceUtil.getInterfaceName(interfaceObject);
    const interfaceMethods: string[] = InterfaceUtil.getInterfaceMethodsName(interfaceObject);
    for (const key of interfaceMethods) {
      if (key === "constructor") {
        continue;
      }
      interfaceObject[key] = this.createMethodProxy(interfaceObject, key, serviceName);
      Logger.info(`接口对象${interfaceName}的${key}方法的代理对象创建成功。`);
    }
    return new Proxy<T>(interfaceObject, {});
  }

  /**
   * 创建方法的代理
   * @param target 目标对象
   * @param methodName 方法名称
   * @param serviceName 服务名称
   * @private
   */
  private createMethodProxy(target: T, methodName: string, serviceName: string): ProxyConstructor {
    const noomiRpcConsumerHandler: NoomiRpcConsumerHandler = new NoomiRpcConsumerHandler(
      serviceName
    );
    return new Proxy(target[methodName], noomiRpcConsumerHandler.getMethodHandler());
  }
}
