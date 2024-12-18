import { AbstractLoadBalancer } from "../AbstractLoadBalancer";
import { Selector } from "../Selector";
import { Logger } from "../../common/logger/Logger";
import { NoomiRpcRequest } from "../../message/NoomiRpcRequest";
import { GlobalCache } from "../../cache/GlobalCache";
import { Application } from "../../common/utils/ApplicationUtil";
import { TipManager } from "../../common/error/TipManager";

/**
 * 一致性hash负载均衡器
 */
export class ConsistentHashLoadBalancer extends AbstractLoadBalancer {
  /**
   * 获取一致性hash负载均衡选择器
   * @param serviceNodes 服务节点
   * @protected
   */
  protected getSelector(serviceNodes: Array<string>): Selector {
    return new this.consistentHashSelector(serviceNodes, 128);
  }

  /**
   * 内部类，一致性hash负载均衡器的具体实现类
   * @private
   */
  private consistentHashSelector = class ConsistentHashSelector implements Selector {
    /**
     * hash环
     * @private
     */
    private circle: Map<number, string> = new Map<number, string>();

    /**
     * 虚拟节点个数
     * @private
     */
    private readonly virtualNodes: number;

    /**
     * 构造函数，初始化时就需要将虚拟节点挂在到hash环上
     * @param serviceNodes 服务节点
     * @param virtualNodes 虚拟节点个数
     */
    public constructor(serviceNodes: Array<string>, virtualNodes: number) {
      this.virtualNodes = virtualNodes;
      serviceNodes.forEach((serviceNode) => this.addNodeToCircle(serviceNode));
    }

    /**
     * 获取一致性hash负载均衡算法下的一个服务节点
     */
    public getNext(): string {
      const noomiRpcRequest: NoomiRpcRequest = GlobalCache.localStorage.getStore();
      const requestId: string = noomiRpcRequest.getRequestId().toString();
      const digest: Buffer = Application.crypto.createHash("md5").update(requestId).digest();
      const hash: number = this.hashCalculate(digest, 0);
      if (!this.circle.has(hash)) {
        const keys: number[] = Array.from(this.circle.keys()).sort();
        const filterKeys: number[] = keys.filter((item) => item >= hash);
        if (filterKeys.length === 0) {
          return this.circle.get(keys[0]);
        }
        return this.circle.get(filterKeys[0]);
      }
      return this.circle.get(hash);
    }

    /**
     * 将每个节点挂在到hash环上
     * @param serviceNode 具体节点的地址
     */
    private addNodeToCircle(serviceNode: string): void {
      for (let i = 0; i < this.virtualNodes / 4; i++) {
        const digest: Buffer = Application.crypto
          .createHash("md5")
          .update(serviceNode + i)
          .digest();
        for (let j = 0; j < 4; j++) {
          const hashValue: number = this.hashCalculate(digest, j);
          this.circle.set(hashValue, serviceNode);
          Logger.debug(TipManager.getTip("0131", hashValue));
        }
      }
    }

    /**
     * hash计算
     * @param value 需要hash计算的字符串
     * @param number 32位，8位一段，number表示第几段
     * @private
     */
    private hashCalculate(value: Buffer, number: number): number {
      return (
        (((value[3 + number * 4] & 0xff) << 24) |
          ((value[2 + number * 4] & 0xff) << 16) |
          ((value[1 + number * 4] & 0xff) << 8) |
          (value[number * 4] & 0xff)) &
        0xffffffff
      );
    }
  };
}
