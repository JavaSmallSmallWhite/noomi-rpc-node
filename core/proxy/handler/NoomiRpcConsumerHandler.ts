import {createConnection, Socket} from "net";
import {RequestPayload} from "../../message/RequestPayload";
import {NoomiRpcRequest} from "../../message/NoomiRpcRequest";
import {AddressPort, NetUtil} from "../../common/utils/NetUtil";
import {HandlerFactory} from "../../sockethandler/HandlerFactory";
import {RequestType} from "../../code/RequestType";
import {SerializerFactory} from "../../serialize/SerializerFactory";
import {CompressorFactory} from "../../compress/CompressorFactory";
import {LoadBalancerFactory} from "../../loadbalance/LoadBalancerFactory";
import {GlobalCache} from "../../cache/GlobalCache";
import {NoomiRpcStarter} from "../../NoomiRpcStarter";

/**
 * Rpc请求处理器
 */
export class NoomiRpcConsumerHandler {

    /**
     * 服务名称
     * @private
     */
    private readonly serviceName: string;

    /**
     *
     * @param serviceName 服务名称
     */
    constructor(serviceName: string) {
        this.serviceName = serviceName;
    }

    /**
     * 获取代理方法的handler
     */
    public getMethodHandler(): ProxyHandler<Function> {
        return {
            apply: this.noomiRpcConsumerInvocationHandler.bind(this),
        }
    }

    /**
     * 请求处理方法
     * 1.封装报文 2.发现可用的服务 3.建立连接 4.发送请求 5.得到结果
     * @param originalMethod 调用的方法
     * @param thisArg this指向
     * @param argumentsList 参数列表
     */
    public async noomiRpcConsumerInvocationHandler(originalMethod: Function, thisArg: Object, argumentsList: Array<unknown>): Promise<unknown> {
        // 1. 封装报文 请求体 和 请求
        const requestPayload: RequestPayload = new RequestPayload();
        requestPayload.setServiceName(this.serviceName);
        requestPayload.setMethodName(originalMethod.name);

        // todo 一个很大的问题，数组会有两种情况，一种数组为元组，["aaaa", 10, true]，每个元素类型不一，
        // todo 一种为单一类型的数组，两种生成的序列化描述完全不一，暂时全部当作元组处理，效率很低。
        requestPayload.setArgumentsList(argumentsList);

        const noomiRpcRequest: NoomiRpcRequest = new NoomiRpcRequest();
        noomiRpcRequest.setRequestId(NoomiRpcStarter.getInstance().getConfiguration().idGenerator.getId());
        noomiRpcRequest.setRequestType(RequestType.COMMON_REQUEST);
        noomiRpcRequest.setSerializeType(SerializerFactory.getSerializer(NoomiRpcStarter.getInstance().getConfiguration().serializerType).code);
        noomiRpcRequest.setCompressType(CompressorFactory.getCompressor(NoomiRpcStarter.getInstance().getConfiguration().compressorType).code);
        const descriptionMethodKey: string = this.serviceName + "+" + originalMethod.name;
        if (GlobalCache.DESCRIPTION_LIST.has(descriptionMethodKey)) {
            const descriptionId: string = GlobalCache.DESCRIPTION_LIST.get(descriptionMethodKey);
            noomiRpcRequest.setDescriptionId(BigInt(descriptionId));
        } else {
            const descriptionId: string = NoomiRpcStarter.getInstance().getConfiguration().idGenerator.getId().toString();
            GlobalCache.DESCRIPTION_LIST.set(descriptionMethodKey, descriptionId);
            noomiRpcRequest.setDescriptionId(BigInt(descriptionId));
        }
        noomiRpcRequest.setRequestPayload(requestPayload);

        // 2. 发现可用的服务
        const serviceNode: string = await LoadBalancerFactory
            .getLoadBalancer(NoomiRpcStarter.getInstance().getConfiguration().loadBalancerType)
            .impl
            .selectServerAddress(this.serviceName);

        GlobalCache.localStorage.enterWith(noomiRpcRequest);

        // 3.建立连接
        let socketChannel: Socket = GlobalCache.CHANNEL_CACHE.get(serviceNode);
        if (!socketChannel) {
            const [address, port]: AddressPort = NetUtil.parseAddress(serviceNode);
            socketChannel = createConnection(port, address);
            socketChannel.setKeepAlive(true);
            GlobalCache.CHANNEL_CACHE.set(serviceNode, socketChannel);
        }

        // 4. 发送请求并返回结果
        return await HandlerFactory.handleConsumerRequestAndResponse(socketChannel, noomiRpcRequest);
    }
}
