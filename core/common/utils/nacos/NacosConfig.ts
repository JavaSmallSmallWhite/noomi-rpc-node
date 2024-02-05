/**
 * nacos注册中心连接配置
 */
export interface NacosRegistryConnectConfig {
    /**
     * 日志类型，nacos只支持console
     */
    logger: typeof console,
    /**
     * 配置中心的连接
     */
    serverList: string | string[],
    /**
     * nacos的命名空间
     */
    namespace?: string,
    username?: string,
    password?: string,
    endpoint?: string,
    vipSrvRefInterMillis?: number,
    ssl?: boolean
}

/**
 * nacos的服务实例配置
 */
export interface NacosServiceInstance {
    /**
     * instance实例ip
     */
    ip: string,
    /**
     * instance实例端口
     */
    port: number,
    metadata: unknown,
    instanceId?: string
    serviceName?: string
    healthy?: boolean,
    enabled?: boolean,
    weight?: number,
    ephemeral?: boolean,
    clusterName?: string
}
