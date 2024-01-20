/**
 * 负载均衡算法接口
 */
export interface Selector {
    /**
     * 根据服务列表执行一种算法，获取一个服务节点
     * @return 具体的服务节点
     */
    getNext(): string;
}
