import {Logger} from "../common/logger/Logger";
import {NoomiRpcConsumerHandler} from "./handler/NoomiRpcConsumerHandler";
import {NoomiRpcStarter} from "../NoomiRpcStarter";
import {InterfaceUtil} from "../common/utils/InterfaceUtil";
import {Starter} from "../index";

/**
 *  接口的代理
 */
export class InterfaceMethodProxy<T extends Object> {

    /**
     * 为接口对象创建代理
     * @param interfaceObject 接口对象
     */
    public createProxyForInterface(interfaceObject: T): T {
        const interfaceName: string = InterfaceUtil.getInterfaceName(interfaceObject);
        const interfaceMethods: string[] = InterfaceUtil.getInterfaceMethodsName(interfaceObject);
        for (const key of interfaceMethods) {
            if (key === 'constructor') {
                continue;
            }
            interfaceObject[key] = this.createMethodProxy(interfaceObject, key);
            Logger.info(`接口对象${interfaceName}的${key}方法的代理对象创建成功。`)
        }
        return new Proxy<T>(interfaceObject, {});
    }

    /**
     * 创建方法的代理
     * @param target 目标对象
     * @param methodName 方法名称
     * @private
     */
    private createMethodProxy(target: T, methodName: string): ProxyConstructor {
        const servicePrefix: string = Starter.getInstance().getConfiguration().servicePrefix;
        const interfaceName: string = InterfaceUtil.getInterfaceName(target);
        const serviceName: string = InterfaceUtil.combine(servicePrefix, interfaceName);
        const noomiRpcConsumerHandler: NoomiRpcConsumerHandler = new NoomiRpcConsumerHandler(serviceName);
        return new Proxy(target[methodName], noomiRpcConsumerHandler.getMethodHandler());
    }
}
