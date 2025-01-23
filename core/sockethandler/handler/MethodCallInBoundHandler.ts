import { NoomiRpcRequest } from "../../message/NoomiRpcRequest";
import { RequestPayload } from "../../message/RequestPayload";
import { ServiceConfig } from "../../ServiceConfig";
import { InBoundHandler } from "../InBoundHandler";
import { NoomiRpcResponse } from "../../message/NoomiRpcResponse";
import { Logger } from "../../common/logger/Logger";
import { ResponseType } from "../../code/ResponseType";
import { RequestType } from "../../code/RequestType";
import { ResponsePayload } from "../../message/ResponsePayload";
import { GlobalCache } from "../../cache/GlobalCache";
import { RateLimiter } from "../../sentinel/ratelimit/RateLimiter";
import { ShutdownHolder } from "../../shutdown/ShutdownHolder";
import { NoomiRpcStarter } from "../../NoomiRpcStarter";
import { RateLimiterFactory } from "../../sentinel/ratelimit/RateLimiterFactory";
import { Socket } from "../../common/utils/TypesUtil";
import { FilterFactory } from "../../filter/FilterFactory";
import { WebAfterHandler } from "../../webafter/WebAfterHandler";
import { TipManager } from "../../common/error/TipManager";
import { NoomiRpcError } from "../../common/error/NoomiRpcError";

/**
 * 服务调用处理器
 */
export class MethodCallInBoundHandler extends InBoundHandler<NoomiRpcRequest, NoomiRpcResponse> {
  /**
   * 请求处理并转换为响应
   * @param socketChannel socket通道
   * @param noomiRpcRequest noomi rpc请求
   */
  protected async handle(
    socketChannel: Socket,
    noomiRpcRequest: NoomiRpcRequest
  ): Promise<NoomiRpcResponse> {
    const noomiRpcResponse: NoomiRpcResponse = new NoomiRpcResponse();
    const responsePayload: ResponsePayload = new ResponsePayload();
    noomiRpcResponse.setRequestId(noomiRpcRequest.getRequestId());
    noomiRpcResponse.setSerializeType(noomiRpcRequest.getSerializeType());
    noomiRpcResponse.setCompressType(noomiRpcRequest.getCompressType());
    // 挡板开启，服务器即将关闭处理
    if (ShutdownHolder.BAFFLE) {
      noomiRpcResponse.setResponseType(ResponseType.BE_CLOSING);
      return noomiRpcResponse;
    }
    ShutdownHolder.REQUEST_COUNTER++;
    // 设置限流器
    const everyIpRateLimiter: Map<string, RateLimiter> =
      NoomiRpcStarter.getInstance().getConfiguration().everyIpRateLimiter;
    const address: string = socketChannel.remoteAddress;
    let rateLimiter: RateLimiter = everyIpRateLimiter.get(address);
    if (!rateLimiter) {
      rateLimiter = RateLimiterFactory.getRateLimiter(
        NoomiRpcStarter.getInstance().getConfiguration().rateLimiterType
      );
      everyIpRateLimiter.set(address, rateLimiter);
    }
    const allowRequest: boolean = rateLimiter.allowRequest();

    if (!allowRequest) {
      Logger.error(TipManager.getTip("0707"));
      // 处理限流
      noomiRpcResponse.setResponseType(ResponseType.RATE_LIMIT);
    } else if (noomiRpcRequest.getRequestType() === RequestType.HEART_BEAT_REQUEST) {
      // 处理心跳
      noomiRpcResponse.setResponseType(ResponseType.SUCCESS_HEART_BEAT);
    } else {
      // 处理正常调用
      const requestPayload: RequestPayload = noomiRpcRequest.getRequestPayload();
      responsePayload.setServiceName(requestPayload.getServiceName());
      responsePayload.setMethodName(requestPayload.getMethodName());
      try {
        // 前置过滤器执行
        if (
          !(await FilterFactory.doChain(
            requestPayload.getServiceName(),
            requestPayload,
            responsePayload
          ))
        ) {
          noomiRpcResponse.setResponseType(ResponseType.SUCCESS_COMMON);
          noomiRpcResponse.setResponseBody(responsePayload);
          return noomiRpcResponse;
        }
        // 方法调用
        let returnValue: unknown = await this.callMethod(requestPayload);
        // 后置处理器执行
        returnValue = await WebAfterHandler.doChain(
          responsePayload.getServiceName(),
          returnValue,
          noomiRpcResponse.getResponseBody()
        );
        responsePayload.setReturnValue(returnValue);
        noomiRpcResponse.setResponseType(ResponseType.SUCCESS_COMMON);
        noomiRpcResponse.setResponseBody(responsePayload);
        Logger.debug(TipManager.getTip("0155"));
      } catch (error) {
        Logger.error(TipManager.getTip("0145", noomiRpcRequest.getRequestId()));
        noomiRpcResponse.setResponseType(ResponseType.FAIL);
      }
    }
    ShutdownHolder.REQUEST_COUNTER--;
    return noomiRpcResponse;
  }

  /**
   * 方法调用
   * @param requestPayload 请求体
   */
  private async callMethod(requestPayload: RequestPayload): Promise<unknown> {
    const serviceName: string = requestPayload.getServiceName();
    const methodName: string = requestPayload.getMethodName();
    const argumentsList: Array<unknown> = requestPayload.getArgumentsList();
    const service: ServiceConfig<NonNullable<unknown>> = GlobalCache.SERVICES_LIST.get(serviceName);
    let returnValue: unknown;
    try {
      returnValue = await service.interfaceProvider[methodName](...argumentsList);
    } catch (error) {
      throw new NoomiRpcError("0900", serviceName, methodName, error.message);
    }
    return returnValue;
  }
}
