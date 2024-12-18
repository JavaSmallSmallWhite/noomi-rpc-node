import { ObjectWrapper } from "../configuration/ObjectWrapper";
import { LoadBalancer } from "./LoadBalancer";
import { RoundRobinLoadBalancer } from "./impl/RoundRobinLoadBalancer";
import { Logger } from "../common/logger/Logger";
import { ConsistentHashLoadBalancer } from "./impl/ConsistentHashLoadBalancer";
import { MinimumResponseTimeLoadBalancer } from "./impl/MinimumResponseTimeLoadBalancer";
import { ObjectWrapperFactory } from "../configuration/ObjectWrapperFactory";
import { ObjectWrapperType, UnknownClass } from "../configuration/ObjectWrapperType";
import { InstanceFactory } from "noomi";
import { RandomLoadBalancer } from "./impl/RandomLoadBalancer";
import { WeightLoadBalancer } from "./impl/WeightLoadBalancer";
import { WeightRobinLoadBalancer } from "./impl/WeightRobinLoadBalancer";
import { NoomiRpcError } from "../common/error/NoomiRpcError";
import { TipManager } from "../common/error/TipManager";

/**
 * 负载均衡器工厂
 */
export class LoadBalancerFactory {
  /**
   * 负载均衡类型缓存器
   * @private
   */
  private static readonly LOADBALANCER_CACHE: Map<string, ObjectWrapper<LoadBalancer>> = new Map<
    string,
    ObjectWrapper<LoadBalancer>
  >();

  /**
   * 负载均衡类型编号缓存器
   * @private
   */
  private static readonly LOADBALANCER_CACHE_CODE: Map<number, ObjectWrapper<LoadBalancer>> =
    new Map<number, ObjectWrapper<LoadBalancer>>();

  /**
   * 类加载时就将所有的负载均衡器添加到缓存器中
   */
  static {
    InstanceFactory.addInstance(RoundRobinLoadBalancer, { singleton: true });
    InstanceFactory.addInstance(ConsistentHashLoadBalancer, { singleton: true });
    InstanceFactory.addInstance(MinimumResponseTimeLoadBalancer, { singleton: true });
    InstanceFactory.addInstance(RandomLoadBalancer, { singleton: true });
    InstanceFactory.addInstance(WeightLoadBalancer, { singleton: true });
    InstanceFactory.addInstance(WeightRobinLoadBalancer, { singleton: true });

    ObjectWrapperFactory.addObjectWrapperConfig("RoundRobinLoadBalancer", [
      1,
      "RoundRobinLoadBalancer",
      RoundRobinLoadBalancer
    ]);
    ObjectWrapperFactory.addObjectWrapperConfig("ConsistentHashLoadBalancer", [
      2,
      "ConsistentHashLoadBalancer",
      ConsistentHashLoadBalancer
    ]);
    ObjectWrapperFactory.addObjectWrapperConfig("MinimumResponseTimeLoadBalancer", [
      3,
      "MinimumResponseTimeLoadBalancer",
      MinimumResponseTimeLoadBalancer
    ]);
    ObjectWrapperFactory.addObjectWrapperConfig("RandomLoadBalancer", [
      4,
      "RandomLoadBalancer",
      RandomLoadBalancer
    ]);
    ObjectWrapperFactory.addObjectWrapperConfig("WeightLoadBalancer", [
      5,
      "WeightLoadBalancer",
      WeightLoadBalancer
    ]);
    ObjectWrapperFactory.addObjectWrapperConfig("WeightRobinLoadBalancer", [
      6,
      "WeightRobinLoadBalancer",
      WeightRobinLoadBalancer
    ]);

    // const roundRobinLoadBalancer: ObjectWrapper<LoadBalancer> = new ObjectWrapper<LoadBalancer>(1, "RoundRobinLoadBalancer", new RoundRobinLoadBalancer());
    // const consistentHashLoadBalancer: ObjectWrapper<LoadBalancer> = new ObjectWrapper<LoadBalancer>(2, "ConsistentHashLoadBalancer", new ConsistentHashLoadBalancer());
    // const minimumResponseTimeLoadBalancer: ObjectWrapper<LoadBalancer> = new ObjectWrapper<LoadBalancer>(3, "MinimumResponseTimeLoadBalancer", new MinimumResponseTimeLoadBalancer());
    //
    // this.LOADBALANCER_CACHE.set("RoundRobinLoadBalancer", roundRobinLoadBalancer);
    // this.LOADBALANCER_CACHE.set("ConsistentHashLoadBalancer", consistentHashLoadBalancer);
    // this.LOADBALANCER_CACHE.set("MinimumResponseTimeLoadBalancer", minimumResponseTimeLoadBalancer);
    //
    // this.LOADBALANCER_CACHE_CODE.set(1, roundRobinLoadBalancer);
    // this.LOADBALANCER_CACHE_CODE.set(2, consistentHashLoadBalancer);
    // this.LOADBALANCER_CACHE_CODE.set(3, minimumResponseTimeLoadBalancer);
  }

  /**
   * 使用工厂方法获取一个LoadBalancerWrapper
   * @param loadBalancerTypeOrCode 负载均衡类型或负载均衡码
   */
  public static getLoadBalancer(
    loadBalancerTypeOrCode: string | number
  ): ObjectWrapper<LoadBalancer> {
    if (typeof loadBalancerTypeOrCode === "string") {
      const loadBalancerObjectWrapper: ObjectWrapper<LoadBalancer> =
        this.LOADBALANCER_CACHE.get(loadBalancerTypeOrCode);
      if (!loadBalancerObjectWrapper) {
        Logger.error(TipManager.getError("0600", loadBalancerTypeOrCode));
        return this.LOADBALANCER_CACHE.get("RoundRobinLoadBalancer");
      }
      return this.LOADBALANCER_CACHE.get(loadBalancerTypeOrCode);
    }
    if (typeof loadBalancerTypeOrCode === "number") {
      const loadBalancerObjectWrapper: ObjectWrapper<LoadBalancer> =
        this.LOADBALANCER_CACHE_CODE.get(loadBalancerTypeOrCode);
      if (!loadBalancerObjectWrapper) {
        Logger.error(TipManager.getError("0601", loadBalancerTypeOrCode));
        return this.LOADBALANCER_CACHE_CODE.get(1);
      }
      return this.LOADBALANCER_CACHE_CODE.get(loadBalancerTypeOrCode);
    }
    Logger.error(TipManager.getError("0602"));
    return this.LOADBALANCER_CACHE_CODE.get(1);
  }

  /**
   * 新增一个负载均衡器
   * @param loadBalancerObjectWrapper
   */
  public static addLoadBalancer(
    loadBalancerObjectWrapper: ObjectWrapper<LoadBalancer> | string
  ): ObjectWrapper<LoadBalancer> {
    if (typeof loadBalancerObjectWrapper === "string") {
      const loadBalancerConfig: ObjectWrapperType =
        ObjectWrapperFactory.getObjectWrapperConfig(loadBalancerObjectWrapper);
      loadBalancerConfig[2] = <LoadBalancer>(
        InstanceFactory.getInstance(<UnknownClass>loadBalancerConfig[2])
      );
      const loadBalancerWrapper: ObjectWrapper<LoadBalancer> = <ObjectWrapper<LoadBalancer>>(
        Reflect.construct(ObjectWrapper, loadBalancerConfig)
      );
      this.LOADBALANCER_CACHE.set(loadBalancerConfig[1], loadBalancerWrapper);
      this.LOADBALANCER_CACHE_CODE.set(loadBalancerConfig[0], loadBalancerWrapper);
      return loadBalancerWrapper;
    }
    if (this.LOADBALANCER_CACHE_CODE.has(loadBalancerObjectWrapper.code)) {
      throw new NoomiRpcError("0603", loadBalancerObjectWrapper.code);
    }
    if (this.LOADBALANCER_CACHE.has(loadBalancerObjectWrapper.name)) {
      throw new NoomiRpcError("0604", loadBalancerObjectWrapper.name);
    }
    this.LOADBALANCER_CACHE.set(loadBalancerObjectWrapper.name, loadBalancerObjectWrapper);
    this.LOADBALANCER_CACHE_CODE.set(loadBalancerObjectWrapper.code, loadBalancerObjectWrapper);
  }
}
