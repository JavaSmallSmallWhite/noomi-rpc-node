import { AbstractLoadBalancer } from "../AbstractLoadBalancer";
import { Selector } from "../Selector";
import { Logger } from "../../common/logger/Logger";
import { LoadBalancerError } from "../../common/error/LoadBalancerError";

/**
 * 轮询负载均衡器
 */
export class RoundRobinLoadBalancer extends AbstractLoadBalancer {
  /**
   * 获取轮询负载均衡选择器
   * @param serviceNodes 服务节点
   * @protected
   */
  protected getSelector(serviceNodes: Array<string>): Selector {
    return new this.roundRobinSelector(serviceNodes);
  }

  /**
   * 内部类，轮询负载均衡器的具体实现类
   * @private
   */
  private roundRobinSelector = class RoundRobinSelector implements Selector {
    /**
     * 服务列表
     * @private
     */
    private readonly serviceNodes: Array<string>;

    /**
     * 轮询指针
     * @private
     */
    private index: number;

    /**
     * 轮询负载均衡器的构造器，传入服务列表来进行选择
     * @param serviceNodes 服务节点
     */
    public constructor(serviceNodes: Array<string>) {
      this.serviceNodes = serviceNodes;
      this.index = 0;
    }

    /**
     * 获取轮询负载均衡算法下的一个服务节点
     */
    public getNext(): string {
      if (!this.serviceNodes || this.serviceNodes.length === 0) {
        Logger.error("进行负载均衡选取节点时发现服务列表为空。");
        throw new LoadBalancerError("本地没有获取到服务列表。");
      }
      const serviceNode: string = this.serviceNodes[this.index];
      if (this.index === this.serviceNodes.length - 1) {
        this.index = 0;
      } else {
        this.index++;
      }
      return serviceNode;
    }
  };
}
