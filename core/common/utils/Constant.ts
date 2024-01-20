import ZooKeeper from "zookeeper";

/**
 * 默认配置常量
 */
export class Constant {
    /**
     * --------------------zookeeper注册中心相关默认配置--------------------------------
     */

    /**
     * zookeeper注册中心的默认连接地址
     */
    public static readonly DEFAULT_ZK_CONNECT_STRING: string = "127.0.0.1:2181";
    // public static readonly DEFAULT_ZK_CONNECT: string = "127.0.0.1:2181";
    // /**
    //  * zookeeper注册中心默认的超时时间
    //  */
    // public static readonly TIME_OUT: number = 10000;
    // /**
    //  * zookeeper注册中心默认的日志等级
    //  */
    // public static readonly DEBUG_LEVEL: number = ZooKeeper.ZOO_LOG_LEVEL_INFO;
    // /**
    //  * zookeeper注册中心默认不按顺序去连接ZooKeeper Server集群中的主机
    //  */
    // public static readonly HOST_ORDER_DETERMINISTIC: boolean = true;

    /**
     * --------------------服务提供方和调用方在注册中心的基础路径--------------------------------------
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
     * --------------------nacos注册中心默认相关配置--------------------------------
     */

    /**
     * nacos注册中心默认连接地址
     */
    public static readonly SERVICE_LIST: string | string[] = "127.0.0.1:8848";
    /**
     * nacos注册中心默认命名空间
     */
    public static readonly NAMESPACE: string = "public";

}
