import { AbstractLoadBalancer } from "../AbstractLoadBalancer";
import { Selector } from "../Selector";
import { Logger } from "../../common/logger/Logger";
import { GlobalCache } from "../../cache/GlobalCache";
import { Socket } from "../../common/utils/TypesUtil";
import { TipManager } from "../../common/error/TipManager";

/**
 * 最短响应时间负载均衡器
 */
export class MinimumResponseTimeLoadBalancer extends AbstractLoadBalancer {
  /**
   * 获取最短响应时间负载均衡选择器
   * @protected
   */
  protected getSelector(): Selector {
    return new this.minimumResponseTimeSelector();
  }

  /**
   * 内部类，最短响应时间负载均衡器的具体实现类
   * @private
   */
  private minimumResponseTimeSelector = class MinimumResponseTimeSelector implements Selector {
    /**
     * 获取最短响应时间负载均衡算法下的一个服务节点
     */
    public getNext(): string {
      const keys: bigint[] = Array.from(GlobalCache.ANSWER_TIME_CHANNEL_CACHE.keys()).sort();
      if (keys.length > 0) {
        Logger.debug(TipManager.getTip("0132", keys[0]));
        const socketChannel: Socket = GlobalCache.ANSWER_TIME_CHANNEL_CACHE.get(keys[0]);
        return socketChannel.remoteAddress + ":" + socketChannel.remotePort;
      }
      const socketChannel: Socket = Array.from(GlobalCache.CHANNEL_CACHE.values())[0];
      return socketChannel.remoteAddress + ":" + socketChannel.remotePort;
    }
  };
}
