import { AbstractLoadBalancer } from "../AbstractLoadBalancer";
import { Selector } from "../Selector";

/**
 * 随机负载均衡器
 */
export class RandomLoadBalancer extends AbstractLoadBalancer {
  /**
   * 获取随机负载均衡选择器
   * @param serviceNodes 服务节点列表
   * @protected
   */
  protected getSelector(serviceNodes: Array<string>): Selector {
    return new this.randomSelector(serviceNodes);
  }

  /**
   * 内部类，随机负载均衡器的具体实现类
   * @private
   */
  private randomSelector = class RandomSelector implements Selector {
    /**
     * 服务列表
     * @private
     */
    private readonly serviceNodes: Array<string>;

    /**
     * 随机负载均衡器的构造器，传入服务列表来进行选择
     * @param serviceNodes 服务节点列表
     */
    public constructor(serviceNodes: string[]) {
      this.serviceNodes = serviceNodes;
    }

    /**
     * 获取随机负载均衡算法下的一个服务节点
     */
    getNext(): string {
      // [0, this.serviceNodes.length)向下取整
      const index: number = Math.floor(Math.random() * this.serviceNodes.length);
      return this.serviceNodes[index];
    }
  };
}
