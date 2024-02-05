/**
 * 自定义添加负载均衡器的选项
 */
export interface LoadBalancerOption {
    /**
     * 负载均衡器id，1到5号禁止使用，为框架自带负载均衡选项
     */
    loadBalancerId: number,

    /**
     * 是否使用
     */
    isUse: boolean,

    /**
     * 负载均衡器名称，不可与框架自带的负载均衡器名称重复
     */
    loadBalancerName?: string
}
