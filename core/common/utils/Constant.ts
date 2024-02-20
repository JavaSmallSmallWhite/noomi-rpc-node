/**
 * 默认配置常量
 */
export class Constant {
    /**
     * --------------------zookeeper注册中心相关默认配置常量--------------------------------
     */

    /**
     * zookeeper注册中心的默认连接地址
     */
    public static readonly DEFAULT_ZK_CONNECT_STRING: string = "127.0.0.1:2181";

    /**
     * --------------------服务提供方和调用方在注册中心的基础路径常量--------------------------------------
     */

    /**
     * 服务提供方调用方在注册中心的基础路径
     */
    public static readonly BASE_PROVIDERS_PATH: string = "/noomi-rpc-metadata-node/providers";
    /**
     * 服务调用方在注册中心的基础路径
     */
    public static readonly BASE_CONSUMERS_PATH: string = "/noomi-rpc-metadata-node/consumers";

    /**
     * --------------------nacos注册中心默认相关配置常量--------------------------------
     */

    /**
     * nacos注册中心默认连接地址
     */
    public static readonly SERVICE_LIST: string | string[] = "127.0.0.1:8848";
    /**
     * nacos注册中心默认命名空间
     */
    public static readonly NAMESPACE: string = "public";

    public static readonly ENDPOINT: string = null;

    public static readonly VIP_SRV_REF_INTER_MILLIS: number = 30000;

    public static readonly SSL: boolean = false;

    /**
     * --------------------nacos服务默认相关配置常量--------------------------------
     */
    public static readonly HEALTHY: boolean = true;

    public static readonly ENABLED: boolean = true;

    public static readonly WEIGHT: number = 1;

    public static readonly EPHEMERAL: boolean = true;

    public static readonly CLUSTER_NAME: string = "DEFAULT";

    public static readonly GROUP_NAME: string = "DEFAULT_GROUP";

    /**
     * --------------------心跳检测相关配置常量--------------------------------
     */
    public static readonly HEART_BEAT_CHECK_INTERVAL: number = 2000;
}
