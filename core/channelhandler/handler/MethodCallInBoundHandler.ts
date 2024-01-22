import {Socket} from "net";
import {NoomiRpcRequest} from "../../message/NoomiRpcRequest";
import {RequestPayload} from "../../message/RequestPayload";
import {ServiceConfig} from "../../ServiceConfig";
import {InBoundHandler} from "../InBoundHandler";
import {NoomiRpcResponse} from "../../message/NoomiRpcResponse";
import {Logger} from "../../common/logger/Logger";
import {ResponseType} from "../../enumeration/ResponseType";
import {RequestType} from "../../enumeration/RequestType";
import {ResponsePayload} from "../../message/ResponsePayload";
import {GlobalCache} from "../../cache/GlobalCache";
import {RateLimiter} from "../../protection/ratelimit/RateLimiter";
import {Starter} from "../../index";
import {TokenBuketRateLimiter} from "../../protection/ratelimit/TokenBuketRateLimiter";
import {ShutdownHolder} from "../../shutdown/ShutdownHolder";

/**
 * 服务调用处理器
 */
export class MethodCallInBoundHandler extends InBoundHandler<NoomiRpcRequest, NoomiRpcResponse>{

    /**
     * 请求处理并转换为响应
     * @param socketChannel socket通道
     * @param noomiRpcRequest noomi rpc请求
     */
    public async handle(socketChannel: Socket, noomiRpcRequest: NoomiRpcRequest): Promise<NoomiRpcResponse> {
        const noomiRpcResponse: NoomiRpcResponse = new NoomiRpcResponse();
        const responsePayload: ResponsePayload = new ResponsePayload();
        noomiRpcResponse.setRequestId(noomiRpcRequest.getRequestId());
        noomiRpcResponse.setSerializeType(noomiRpcRequest.getSerializeType());
        noomiRpcResponse.setCompressType(noomiRpcRequest.getCompressType());
        noomiRpcResponse.setOther(noomiRpcRequest.getOther());

        if (ShutdownHolder.BAFFLE) {
            noomiRpcResponse.setResponseType(ResponseType.BE_CLOSING);
            return noomiRpcResponse;
        }

        ShutdownHolder.REQUEST_COUNTER++;

        const everyIpRateLimiter: Map<string, RateLimiter> = Starter.getInstance().getConfiguration().everyIpRateLimiter;
        const address: string = socketChannel.remoteAddress;
        let rateLimiter: RateLimiter = everyIpRateLimiter.get(address);
        if (!rateLimiter) {
            rateLimiter = new TokenBuketRateLimiter(500, 500);
            everyIpRateLimiter.set(address, rateLimiter);
        }
        const allowRequest: boolean = rateLimiter.allowRequest();

        if (!allowRequest) {
            Logger.error("服务端被限流。");
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
                const returnValue: unknown = await this.callMethod(requestPayload);
                responsePayload.setReturnValue(returnValue);
                Logger.debug(`请求${noomiRpcRequest.getRequestId()}已经完成方法的调用`);
            } catch (error) {
                Logger.error(`请求编号为${noomiRpcRequest.getRequestId()}的请求在调用过程中发生异常。`);
                noomiRpcResponse.setResponseType(ResponseType.FAIL)
            }
            noomiRpcResponse.setResponseType(ResponseType.SUCCESS_COMMON);
            noomiRpcResponse.setResponseBody(responsePayload);
        }

        ShutdownHolder.REQUEST_COUNTER--;

        return noomiRpcResponse;
    }

    /**
     * 方法调用
     * @param requestPayload 请求体
     */
    public async callMethod(requestPayload: RequestPayload): Promise<unknown> {
        const serviceName: string = requestPayload.getServiceName();
        const methodName: string = requestPayload.getMethodName();
        const argumentsList: Array<unknown> = requestPayload.getArgumentsList();
        const service: ServiceConfig<Object, Object> = GlobalCache.SERVICES_LIST.get(serviceName);
        let returnValue: unknown;
        try {
            returnValue = await Promise.resolve(service.ref[methodName](...argumentsList));
        } catch (error) {
            Logger.error(`调用服务${serviceName}的方法${methodName}时发生了异常`);
            throw new Error(error.message);
        }
        return returnValue;
    }
}
