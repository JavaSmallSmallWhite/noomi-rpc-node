import { LoadBalancerFactory } from "../../loadbalance/LoadBalancerFactory";
import { ObjectWrapper } from "../../configuration/ObjectWrapper";
import { LoadBalancer } from "../../loadbalance/LoadBalancer";
import { NoomiRpcStarter } from "../../NoomiRpcStarter";

/**
 * 自定义添加负载均衡器的选项
 */
export interface LoadBalancerOption {
  /**
   * 负载均衡器id，1到5号禁止使用，为框架自带负载均衡选项
   */
  loadBalancerId: number;

  /**
   * 是否使用
   */
  isUse?: boolean;

  /**
   * 负载均衡器名称，不可与框架自带的负载均衡器名称重复
   */
  loadBalancerName?: string;
}
/**
 * 负载均衡装饰器，用于添加自定义的负载均衡器，装饰类
 * @constructor
 */
export function CustomLoadBalancer(
  loadBalancerOption: LoadBalancerOption
): (target: Function) => void {
  return (target: Function): void => {
    const loadBalancerName: string = loadBalancerOption["loadBalancerName"] || target.name;
    LoadBalancerFactory.addLoadBalancer(
      new ObjectWrapper<LoadBalancer>(
        loadBalancerOption["loadBalancerId"],
        loadBalancerName,
        Reflect.construct(target, [])
      )
    );
    if (loadBalancerOption.isUse) {
      NoomiRpcStarter.getInstance().getConfiguration().loadBalancerType = loadBalancerName;
    }
  };
}
