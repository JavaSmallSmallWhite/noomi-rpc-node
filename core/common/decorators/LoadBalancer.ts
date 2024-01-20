import {LoadBalancerOption} from "../../loadbalance/LoadBalancerTypes";

/**
 * 负载均衡装饰器，用于添加自定义的负载均衡器
 * @constructor
 */
export function LoadBalancer(loadBalancerConfig: LoadBalancerOption)
    : (value: Function, context?: ClassDecoratorContext) => void {

    return (value: Function, context?: ClassDecoratorContext): void => {
        console.log(value, context, loadBalancerConfig);
    }
}
