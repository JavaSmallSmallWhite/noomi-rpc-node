import { InBoundHandler } from "../InBoundHandler";
import { NoomiRpcResponse } from "../../message/NoomiRpcResponse";
import { ResponseType } from "../../code/ResponseType";
import { Logger } from "../../common/logger/Logger";
import { CircuitBreaker } from "../../sentinel/circuitbreak/CircuitBreaker";
import { GlobalCache } from "../../cache/GlobalCache";
import { LoadBalancerFactory } from "../../loadbalance/LoadBalancerFactory";
import { LoadBalancer } from "../../loadbalance/LoadBalancer";
import { NoomiRpcStarter } from "../../NoomiRpcStarter";
import { Socket } from "../../common/utils/TypesUtil";
import { TipManager } from "../../common/error/TipManager";

/**
 * 结果处理器
 */
export class ResultInBoundHandler extends InBoundHandler<NoomiRpcResponse, unknown> {
  /**
   * 处理服务端发来的响应
   * @param socketChannel socket通道
   * @param noomiRpcResponse 响应
   * @protected
   */
  protected handle(socketChannel: Socket, noomiRpcResponse: NoomiRpcResponse): Promise<unknown> {
    const responseType: number = noomiRpcResponse.getResponseType();
    const everyIpCircuitBreaker: Map<string, CircuitBreaker> =
      NoomiRpcStarter.getInstance().getConfiguration().everyIpCircuitBreaker;
    const serviceNode: string = socketChannel.remoteAddress + ":" + socketChannel.remotePort;
    const circuitBreaker: CircuitBreaker = everyIpCircuitBreaker.get(serviceNode);

    if (responseType === ResponseType.SUCCESS_HEART_BEAT) {
      Logger.debug(TipManager.getTip("0149", noomiRpcResponse.getRequestId()));
    } else if (responseType === ResponseType.SUCCESS_COMMON) {
      Logger.debug(TipManager.getTip("0150", noomiRpcResponse.getRequestId()));
      return Promise.resolve(noomiRpcResponse.getResponseBody().getReturnValue());
    } else if (responseType === ResponseType.RATE_LIMIT) {
      circuitBreaker.recordErrorRequest();
      Logger.error(
        TipManager.getError(
          "0708",
          noomiRpcResponse.getRequestId(),
          noomiRpcResponse.getResponseType()
        )
      );
    } else if (responseType === ResponseType.RESOURCE_NOT_FOUND) {
      circuitBreaker.recordErrorRequest();
      Logger.error(
        TipManager.getError(
          "0709",
          noomiRpcResponse.getRequestId(),
          noomiRpcResponse.getResponseType()
        )
      );
    } else if (responseType === ResponseType.FAIL) {
      circuitBreaker.recordErrorRequest();
      Logger.error(
        TipManager.getError(
          "0710",
          noomiRpcResponse.getRequestId(),
          noomiRpcResponse.getResponseType()
        )
      );
    } else if (responseType === ResponseType.BE_CLOSING) {
      GlobalCache.CHANNEL_CACHE.delete(serviceNode);
      const loadBalancer: LoadBalancer = LoadBalancerFactory.getLoadBalancer(
        NoomiRpcStarter.getInstance().getConfiguration().loadBalancerType
      ).impl;
      loadBalancer.reLoadBalance(noomiRpcResponse.getResponseBody().getServiceName(), [
        ...GlobalCache.CHANNEL_CACHE.keys()
      ]);
      Logger.error(
        TipManager.getError(
          "0711",
          noomiRpcResponse.getRequestId(),
          noomiRpcResponse.getResponseType()
        )
      );
    }
  }
}
