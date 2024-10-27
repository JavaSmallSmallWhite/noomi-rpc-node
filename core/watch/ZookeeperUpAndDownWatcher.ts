import { Logger } from "../common/logger/Logger";
import { Registry } from "../registry/Registry";
import { NoomiRpcStarter } from "../NoomiRpcStarter";
import { AddressPort, NetUtil } from "../common/utils/NetUtil";
import { createConnection, Socket } from "net";
import { LoadBalancerFactory } from "../loadbalance/LoadBalancerFactory";
import { GlobalCache } from "../cache/GlobalCache";
import { Event } from "../common/utils/TypesUtil";
import { Application } from "../common/utils/ApplicationUtil";

/**
 * zookeeper注册中心服务节点的动态上下限监控
 */
export class ZookeeperUpAndDownWatcher {
  /**
   * 监控的所有节点，在getChildren时调用
   * @param event 服务节点事件，服务节点的crud
   */
  public static async process(event: Event): Promise<void> {
    if (event.getType() === Application.zookeeper.Event.NODE_CHILDREN_CHANGED) {
      Logger.debug(`检测到服务${event.getPath()}有节点上/下线，将重新拉取服务列表...`);
      const serviceName: string = getServiceName(event.getPath());
      const registry: Registry = NoomiRpcStarter.getInstance()
        .getConfiguration()
        .registryConfig.getRegistry();
      const serviceNodes: string[] = await registry.lookup(serviceName);
      // 处理新增的节点
      for (const serviceNode of serviceNodes) {
        if (!GlobalCache.CHANNEL_CACHE.has(serviceNode)) {
          const [address, port]: AddressPort = NetUtil.parseAddress(serviceNode);
          const socketChannel: Socket = createConnection(port, address);
          socketChannel.setKeepAlive(true);
          GlobalCache.CHANNEL_CACHE.set(serviceNode, socketChannel);
        }
      }
      // 处理减少的节点
      for (const serviceNode of GlobalCache.CHANNEL_CACHE.keys()) {
        if (!serviceNodes.includes(serviceNode)) {
          GlobalCache.CHANNEL_CACHE.delete(serviceNode);
        }
      }
      // 重新负载均衡
      LoadBalancerFactory.getLoadBalancer(
        NoomiRpcStarter.getInstance().getConfiguration().loadBalancerType
      ).impl.reLoadBalance(serviceName, serviceNodes);
    }

    /**
     * 根据服务路径获取服务名称
     * @param nodePath 服务路径
     * @private
     */
    function getServiceName(nodePath: string): string {
      const split: Array<string> = nodePath.split("/");
      return split[split.length - 1];
    }
  }
}
