import { RequestPayload } from "../../message/RequestPayload";
import { NoomiRpcRequest } from "../../message/NoomiRpcRequest";
import { AddressPort, NetUtil } from "../../common/utils/NetUtil";
import { HandlerFactory } from "../../sockethandler/HandlerFactory";
import { RequestType } from "../../code/RequestType";
import { SerializerFactory } from "../../serialize/SerializerFactory";
import { CompressorFactory } from "../../compress/CompressorFactory";
import { LoadBalancerFactory } from "../../loadbalance/LoadBalancerFactory";
import { GlobalCache } from "../../cache/GlobalCache";
import { NoomiRpcStarter } from "../../NoomiRpcStarter";
import { Socket } from "../../common/utils/TypesUtil";
import { Application } from "../../common/utils/ApplicationUtil";

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
   * 构造器
   * @param serviceName 服务名称
   */
  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * 获取代理方法的handler
   */
  public getMethodHandler(): ProxyHandler<(...args: unknown[]) => unknown> {
    return {
      apply: this.noomiRpcConsumerInvocationHandler.bind(this)
    };
  }

  /**
   * 请求处理方法
   * 1.封装报文 2.发现可用的服务 3.建立连接 4.发送请求 5.得到结果
   * @param originalMethod 调用的方法
   * @param _thisArg this指向
   * @param argumentsList 参数列表
   */
  public async noomiRpcConsumerInvocationHandler(
    originalMethod: (...args: unknown[]) => unknown,
    _thisArg: NonNullable<unknown>,
    argumentsList: Array<unknown>
  ): Promise<unknown> {
    // 1. 封装报文 请求体 和 请求
    const requestPayload: RequestPayload = new RequestPayload();
    requestPayload.setServiceName(this.serviceName);
    requestPayload.setMethodName(originalMethod.name);
    requestPayload.setArgumentsList(argumentsList);

    const noomiRpcRequest: NoomiRpcRequest = new NoomiRpcRequest();
    noomiRpcRequest.setRequestId(
      NoomiRpcStarter.getInstance().getConfiguration().idGenerator.getId()
    );
    noomiRpcRequest.setRequestType(RequestType.COMMON_REQUEST);
    noomiRpcRequest.setSerializeType(
      SerializerFactory.getSerializer(
        NoomiRpcStarter.getInstance().getConfiguration().serializerType
      ).code
    );
    noomiRpcRequest.setCompressType(
      CompressorFactory.getCompressor(
        NoomiRpcStarter.getInstance().getConfiguration().compressorType
      ).code
    );
    noomiRpcRequest.setRequestPayload(requestPayload);

    // 2. 发现可用的服务
    const serviceNode: string = await LoadBalancerFactory.getLoadBalancer(
      NoomiRpcStarter.getInstance().getConfiguration().loadBalancerType
    ).impl.selectServerAddress(this.serviceName);

    GlobalCache.localStorage.enterWith(noomiRpcRequest);

    // 3.建立连接
    let socketChannel: Socket = GlobalCache.CHANNEL_CACHE.get(serviceNode);
    if (!socketChannel) {
      const [address, port]: AddressPort = NetUtil.parseAddress(serviceNode);
      socketChannel = Application.net.createConnection(port, address);
      socketChannel.setKeepAlive(true);
      GlobalCache.CHANNEL_CACHE.set(serviceNode, socketChannel);
    }

    // 4. 发送请求并返回结果
    return await HandlerFactory.handleConsumerRequestAndResponse(socketChannel, noomiRpcRequest);
  }
}
