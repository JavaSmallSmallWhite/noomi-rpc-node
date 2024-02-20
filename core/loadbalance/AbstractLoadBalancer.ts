import {LoadBalancer} from "./LoadBalancer";
import {Selector} from "./Selector";
import {NoomiRpcStarter} from "../NoomiRpcStarter";

/**
 * 抽象的负载均衡器管理类
 * 子类需继承此类，此类已经封装了基本信息
 */
export abstract class AbstractLoadBalancer implements LoadBalancer {

    /**
     * 一个服务匹配一个Selector
     * @private
     */
    private cache: Map<string, Selector> = new Map<string, Selector>();

    /**
     * 当感知节点发生了动态上下线，我们需要重新进行负载均衡
     * @param serviceName 服务名称
     * @param addresses 服务地址列表
     */
    public reLoadBalance(serviceName: string, addresses: Array<string>): void {
        this.cache.set(serviceName, this.getSelector(addresses));
    }

    /**
     * 根据服务名获取一个可用的服务
     * @param serviceName 服务名称
     * @return 服务地址
     */
    public async selectServerAddress(serviceName: string): Promise<string> {
        // 先从缓存中拿负载均衡选择器
        let selector: Selector = this.cache.get(serviceName);
        if (!selector) {
            const children: string[] = await NoomiRpcStarter
                .getInstance()
                .getConfiguration()
                .registryConfig
                .getRegistry()
                .lookup(serviceName);
            selector = this.getSelector(children);
            this.cache.set(serviceName, selector);
        }
        return selector.getNext();
    }

    /**
     * 由子类进行扩展
     * @param serviceList 服务列表
     * @protected
     * @return 负载均衡算法选择器
     */
    protected abstract getSelector(serviceList: Array<string>): Selector;
}
