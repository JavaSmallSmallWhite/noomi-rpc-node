import { AbstractLoadBalancer } from "../AbstractLoadBalancer";
import { Selector } from "../Selector";

/**
 * 基于权重的负载均衡器
 */
export class WeightLoadBalancer extends AbstractLoadBalancer {
  /**
   * 获取权重负载均衡选择器
   * @param serviceNodes 服务节点列表
   * @protected
   */
  protected getSelector(serviceNodes: Array<string>): Selector {
    return undefined;
  }

  private weightSelector = class WeightSelector implements Selector {
    getNext(): string {
      return "";
    }
  };
}
