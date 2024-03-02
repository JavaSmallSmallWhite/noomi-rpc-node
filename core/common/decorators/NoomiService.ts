import {ServiceConfig} from "../../ServiceConfig";
import {GlobalCache} from "../../cache/GlobalCache";
import {NoomiRpcStarter} from "../../NoomiRpcStarter";

/**
 * 服务配置，具体参考npm nacos的相关选项
 */
interface ServiceConfiguration {
     healthy?: boolean,
     enabled?: boolean,
     weight?: number,
     ephemeral?: boolean,
     clusterName?: string,
    /**
     * 组名
     */
     groupName?: string
}

/**
 * 服务选项
 */
interface ServiceOption<T extends Object> {
    /**
     * 服务提供接口
     */
    interfaceProvider: Function;

    /**
     * 服务前缀
     */
    servicePrefix?: string

    /**
     * 服务配置
     */
    serviceConfiguration?: ServiceConfiguration;
}

/**
 * 服务装饰器，装饰类
 * @constructor
 */
export function NoomiService<T extends Object>(serviceOption: ServiceOption<T>): (target: Function) => void {
    return async (target: Function): Promise<void> => {
        const service: ServiceConfig<T> = new ServiceConfig<T>();
        service.interfaceProvider = serviceOption.interfaceProvider;
        service.ref = target;
        if (serviceOption["servicePrefix"]) {
            service.servicePrefix = serviceOption["servicePrefix"]
        }
        if (serviceOption.serviceConfiguration) {
            GlobalCache.serviceConfiguration = serviceOption.serviceConfiguration
        }
        await NoomiRpcStarter.getInstance().publish(service);
    }
}
