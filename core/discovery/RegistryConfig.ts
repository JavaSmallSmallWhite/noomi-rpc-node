import {ZookeeperRegistry} from "./impl/ZookeeperRegistry";
import {NacosRegistry} from "./impl/NacosRegistry";
import {ZookeeperConnectConfig} from "../common/utils/zookeeper/ZookeeperConfig";
import {NacosRegistryConnectConfig} from "../common/utils/nacos/NacosConfig";
import {Registry} from "./Registry";

/**
 * 连接配置类型
 */
export type RegistryConnectConfig = ZookeeperConnectConfig | NacosRegistryConnectConfig

/**
 * 注册中心配置
 */
export class RegistryConfig {

    /**
     * 注册中心连接配置
     * @private
     */
    private readonly registryConnectConfig: RegistryConnectConfig;

    /**
     * 注册中心名称
     * @private
     */
    private readonly _registryName: string

    /**
     * 构造器，用于配置注册中心
     * @param registryName 注册中心名称
     * @param registryConnectConfig 连接配置
     */
    public constructor(registryName?: string, registryConnectConfig?: RegistryConnectConfig) {
        this._registryName = registryName ? registryName: "zookeeper";
        this.registryConnectConfig = registryConnectConfig;
    }

    /**
     * 获取注册中心
     */
    public getRegistry(): Registry {
        if (this._registryName === "zookeeper") {
            return new ZookeeperRegistry(<ZookeeperConnectConfig>this.registryConnectConfig)
        } else if (this._registryName == "nacos") {
            return new NacosRegistry(<NacosRegistryConnectConfig>this.registryConnectConfig)
        }
    }

    /**
     * ------------------------registryName的getter方法---------------------------------------------
     */
    get registryName(): string {
        return this._registryName;
    }
}
