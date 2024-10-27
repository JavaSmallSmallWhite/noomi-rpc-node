import { AbstractLoadBalancer } from "../AbstractLoadBalancer";
import { Selector } from "../Selector";

/**
 * 基于权重轮询的负载均衡器
 */
export class WeightRobinLoadBalancer extends AbstractLoadBalancer {
  /**
   * 获取权重轮询负载均衡选择器
   * @param serviceNodes 服务节点列表
   * @protected
   */
  protected getSelector(serviceNodes: Array<string>): Selector {
    return undefined;
  }

  private weightRobinSelector = class WeightRobinSelector implements Selector {
    getNext(): string {
      return "";
    }
  };
}
