import {Hosts} from "nacos";
import {NoomiRpcStarter} from "../NoomiRpcStarter";
import {AddressPort, NetUtil} from "../common/utils/NetUtil";
import {createConnection, Socket} from "net";
import {LoadBalancerFactory} from "../loadbalance/LoadBalancerFactory";
import {Logger} from "../common/logger/Logger";
import {SubscribeInfo} from "nacos-naming";
import {GlobalCache} from "../cache/GlobalCache";

/**
 * nacos注册中心服务节点的动态上下限监控
 */
export class NacosUpAndDownWatcher {

    /**
     * 监控的所有节点，在服务注册时调用
     * @param serviceName 服务名称
     * @param hosts 服务节点
     */
    public static process(serviceName: string | SubscribeInfo, hosts: Hosts): void {
        Logger.debug(`检测到服务${serviceName}有节点上/下线，将重新拉取服务列表...`);
        let serviceNodes: Array<string> = [];
        // 处理新增的节点
        for (const host of hosts) {
            serviceName = host.serviceName
            const serviceNode: string = host.ip + ":" + host.port;
            serviceNodes.push(serviceNode);
            if (!GlobalCache.CHANNEL_CACHE.has(serviceNode)) {
                const socketChannel: Socket = createConnection(host.port, host.ip);
                socketChannel.setKeepAlive(true);
                GlobalCache.CHANNEL_CACHE.set(serviceNode, socketChannel);
            }
        }

        // 处理减少的节点
        for (const serviceNode of GlobalCache.CHANNEL_CACHE.keys()) {
            if (!isExistsInHosts(serviceNode)) {
                GlobalCache.CHANNEL_CACHE.delete(serviceNode);
            }
        }

        // 重新负载均衡
        LoadBalancerFactory
            .getLoadBalancer(NoomiRpcStarter.getInstance().getConfiguration().loadBalancerType)
            .impl
            .reLoadBalance(<string>serviceName, serviceNodes);

        /**
         * 判断Hosts中是否存在channel cache中的节点
         * @param serviceNode 服务节点
         */
        function isExistsInHosts(serviceNode: string): boolean {
            const [address, port]: AddressPort = NetUtil.parseAddress(serviceNode);
            for (const host1 of hosts) {
                if (host1.ip === address && host1.port === port) {
                    return true;
                }
            }
            return false;
        }
    }
}
