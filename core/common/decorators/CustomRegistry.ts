import {RegistryConfig} from "../../registry/RegistryConfig";
import {GlobalCache} from "../../cache/GlobalCache";
import {NoomiRpcStarter} from "../../NoomiRpcStarter";

/**
 * 注册中心选项
 */
interface RegistryOption {
    /**
     * 注册中心名称
     */
    registryName: string;

    /**
     * 注册中心连接配置
     */
    registryConnectConfig: unknown;

    /**
     * 是否使用
     */
    isUse?: boolean;

    /**
     * 服务配置
     */
    serviceConfiguration?: unknown;
}

/**
 * 注册中心装饰器，用于添加自定义的注册中心，装饰类
 * @constructor
 */
export function CustomRegistry(registryOption: RegistryOption) {
    return (target: Function): void => {
        const registryConfig: RegistryConfig = new RegistryConfig(registryOption.registryName, registryOption.registryConnectConfig);
        GlobalCache.REGISTRY_CACHE.set(target.name, Reflect.construct(target, [registryOption.registryConnectConfig]))
        if (registryOption.isUse) {
            NoomiRpcStarter.getInstance().getConfiguration().registryConfig = registryConfig;
            if (registryOption.serviceConfiguration) {
                GlobalCache.serviceConfiguration = registryOption.serviceConfiguration
            }
        }
    }
}
