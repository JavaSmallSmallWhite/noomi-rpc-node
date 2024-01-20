/**
 * zookeeper连接配置
 */
export interface ZookeeperConnectConfig {

    /**
     * 连接地址
     */
    connectString: string;

    /**
     * zookeeper连接选项
     */
    options?: {

        /**
         * 会话超时（毫秒）
         */
        sessionTimeout: number,

        /**
         * 每次连接尝试之间的延迟（以毫秒为单位）。
         */
        spinDelay: number,

        /**
         * 连接丢失异常的重试次数。
         */
        retries: number
    };
}
