import {ServiceConfig} from "../../ServiceConfig";
import {Starter} from "../../index";
import {GlobalCache} from "../../cache/GlobalCache";

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
interface ServiceOption<T, V extends Object> {
    /**
     * 服务提供接口
     */
    interfaceProvider: T;

    /**
     * 接口描述
     */
    interfaceDescription: V;

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
export function NoomiService<T, V extends Object>(serviceOption: ServiceOption<T, V>): (target: Function) => void {
    return async (target: Function): Promise<void> => {
        const service: ServiceConfig<T, V> = new ServiceConfig<T, V>();
        service.interfaceProvider = serviceOption.interfaceProvider;
        service.interfaceDescription = serviceOption.interfaceDescription;
        service.ref = Reflect.construct(target, []);
        if (serviceOption["servicePrefix"]) {
            service.servicePrefix = serviceOption["servicePrefix"]
        }
        if (serviceOption.serviceConfiguration) {
            GlobalCache.serviceConfiguration = serviceOption.serviceConfiguration
        }
        await Starter.getInstance().publish(service);
    }
}
