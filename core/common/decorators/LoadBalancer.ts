import {LoadBalancerOption} from "../../loadbalance/LoadBalancerTypes";
import {LoadBalancerFactory} from "../../loadbalance/LoadBalancerFactory";
import {ObjectWrapper} from "../../configuration/ObjectWrapper";
import {LoadBalancer} from "../../loadbalance/LoadBalancer";
import {Starter} from "../../index";

/**
 * 负载均衡装饰器，用于添加自定义的负载均衡器，装饰类
 * @constructor
 */
export function LoadBalancer(loadBalancerOption: LoadBalancerOption): (target: Function) => void {
    return (target: Function): void => {
        const loadBalancerName: string = loadBalancerOption["loadBalancerName"] || target.name
        LoadBalancerFactory.addLoadBalancer(
            new ObjectWrapper<LoadBalancer>(
                loadBalancerOption["loadBalancerId"],
                loadBalancerName,
                Reflect.construct(target, [])
            )
        );
        if (loadBalancerOption.isUse) {
            Starter.getInstance().getConfiguration().loadBalancerType = loadBalancerName;
        }
    }
}
