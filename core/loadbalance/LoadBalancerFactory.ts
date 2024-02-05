import {ObjectWrapper} from "../configuration/ObjectWrapper";
import {LoadBalancer} from "./LoadBalancer";
import {RoundRobinLoadBalancer} from "./impl/RoundRobinLoadBalancer";
import {Logger} from "../common/logger/Logger";
import {ConsistentHashLoadBalancer} from "./impl/ConsistentHashLoadBalancer";
import {MinimumResponseTimeLoadBalancer} from "./impl/MinimumResponseTimeLoadBalancer";

/**
 * 负载均衡器工厂
 */
export class LoadBalancerFactory {
    /**
     * 负载均衡类型缓存器
     * @private
     */
    private static readonly LOADBALANCER_CACHE: Map<string, ObjectWrapper<LoadBalancer>> = new Map<string, ObjectWrapper<LoadBalancer>>();

    /**
     * 负载均衡类型编号缓存器
     * @private
     */
    private static readonly LOADBALANCER_CACHE_CODE: Map<number, ObjectWrapper<LoadBalancer>> = new Map<number, ObjectWrapper<LoadBalancer>>();

    /**
     * 类加载时就将所有的负载均衡器添加到缓存器中
     */
    static {
        const roundRobinLoadBalancer: ObjectWrapper<LoadBalancer> = new ObjectWrapper<LoadBalancer>(1, "RoundRobinLoadBalancer", new RoundRobinLoadBalancer());
        const consistentHashLoadBalancer: ObjectWrapper<LoadBalancer> = new ObjectWrapper<LoadBalancer>(2, "ConsistentHashLoadBalancer", new ConsistentHashLoadBalancer());
        const minimumResponseTimeLoadBalancer: ObjectWrapper<LoadBalancer> = new ObjectWrapper<LoadBalancer>(3, "MinimumResponseTimeLoadBalancer", new MinimumResponseTimeLoadBalancer());

        this.LOADBALANCER_CACHE.set("RoundRobinLoadBalancer", roundRobinLoadBalancer);
        this.LOADBALANCER_CACHE.set("ConsistentHashLoadBalancer", consistentHashLoadBalancer);
        this.LOADBALANCER_CACHE.set("MinimumResponseTimeLoadBalancer", minimumResponseTimeLoadBalancer);

        this.LOADBALANCER_CACHE_CODE.set(1, roundRobinLoadBalancer);
        this.LOADBALANCER_CACHE_CODE.set(2, consistentHashLoadBalancer);
        this.LOADBALANCER_CACHE_CODE.set(3, minimumResponseTimeLoadBalancer);
    }

    /**
     * 使用工厂方法获取一个LoadBalancerWrapper
     * @param loadBalancerTypeOrCode 负载均衡类型或负载均衡码
     * @return SerializerWrapper
     */
    public static getLoadBalancer(loadBalancerTypeOrCode: string | number): ObjectWrapper<LoadBalancer> {
        if (typeof loadBalancerTypeOrCode === "string") {
            const loadBalancerObjectWrapper: ObjectWrapper<LoadBalancer> = this.LOADBALANCER_CACHE.get(loadBalancerTypeOrCode);
            if (!loadBalancerObjectWrapper) {
                Logger.error(`未找到您配置的${loadBalancerTypeOrCode}负载均衡器，默认选用1号RoundRobinLoadBalancer的负载均衡器。`)
                return this.LOADBALANCER_CACHE.get("RoundRobinLoadBalancer");
            }
            return this.LOADBALANCER_CACHE.get(loadBalancerTypeOrCode);
        }
        if (typeof loadBalancerTypeOrCode === "number") {
            const loadBalancerObjectWrapper: ObjectWrapper<LoadBalancer> = this.LOADBALANCER_CACHE_CODE.get(loadBalancerTypeOrCode);
            if (!loadBalancerObjectWrapper) {
                Logger.error(`未找到您配置的编号为${loadBalancerTypeOrCode}负载均衡器，默认选用1号RoundRobinLoadBalancer的负载均衡器。`)
                return this.LOADBALANCER_CACHE_CODE.get(1);
            }
            return this.LOADBALANCER_CACHE_CODE.get(loadBalancerTypeOrCode);
        }
        Logger.error("不存在您所指定的负载均衡类型或负载均衡码，默认选用1号RoundRobinLoadBalancer的负载均衡器。");
        return this.LOADBALANCER_CACHE_CODE.get(1);

    }

    /**
     * 新增一个负载均衡器
     * @param loadBalancerObjectWrapper
     */
    public static addLoadBalancer(loadBalancerObjectWrapper: ObjectWrapper<LoadBalancer>): void {
        this.LOADBALANCER_CACHE.set(loadBalancerObjectWrapper.name, loadBalancerObjectWrapper);
        this.LOADBALANCER_CACHE_CODE.set(loadBalancerObjectWrapper.code, loadBalancerObjectWrapper);
    }
}
