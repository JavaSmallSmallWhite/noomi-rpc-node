/**
 * 负载均衡器接口
 */
export interface LoadBalancer {
    /**
     * 根据服务名获取一个可用的服务
     * @param serviceName 服务名称
     * @return 服务地址
     */
    selectServerAddress(serviceName: string): Promise<string>;

    /**
     * 当感知节点发生了动态上下线，我们需要重新进行负载均衡
     * @param serviceName 服务名称
     * @param addresses 服务地址列表
     */
    reLoadBalance(serviceName: string, addresses: Array<string>): void;
}
