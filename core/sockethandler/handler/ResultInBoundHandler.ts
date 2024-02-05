import {InBoundHandler} from "../InBoundHandler";
import {NoomiRpcResponse} from "../../message/NoomiRpcResponse";
import {Socket} from "net";
import {ResponseType} from "../../code/ResponseType";
import {Logger} from "../../common/logger/Logger";
import {CircuitBreaker} from "../../sentinel/circuitbreak/CircuitBreaker";
import {Starter} from "../../index";
import {ResponseError} from "../../common/error/ResponseError";
import {GlobalCache} from "../../cache/GlobalCache";
import {LoadBalancerFactory} from "../../loadbalance/LoadBalancerFactory";
import {LoadBalancer} from "../../loadbalance/LoadBalancer";

/**
 * 结果处理器
 */
export class ResultInBoundHandler extends InBoundHandler<NoomiRpcResponse, unknown>{

    /**
     * 处理服务端发来的响应
     * @param socketChannel socket通道
     * @param noomiRpcResponse 响应
     * @protected
     */
    protected handle(socketChannel: Socket, noomiRpcResponse: NoomiRpcResponse): Promise<unknown> {
        const responseType: number = noomiRpcResponse.getResponseType();
        const everyIpCircuitBreaker: Map<string, CircuitBreaker> = Starter.getInstance().getConfiguration().everyIpCircuitBreaker;
        const serviceNode: string = socketChannel.remoteAddress + ":" + socketChannel.remotePort;
        const circuitBreaker: CircuitBreaker = everyIpCircuitBreaker.get(serviceNode);

        if (responseType === ResponseType.SUCCESS_HEART_BEAT) {
            Logger.debug(`已寻找到编号为${noomiRpcResponse.getRequestId()}的请求和响应，处理心跳检测，处理结果。`);
        } else if (responseType === ResponseType.SUCCESS_COMMON) {
            Logger.debug(`已寻找到编号为${noomiRpcResponse.getRequestId()}的请求和响应，处理结果。`);
            return Promise.resolve(noomiRpcResponse.getResponseBody().getReturnValue());
        } else if (responseType === ResponseType.RATE_LIMIT) {
            circuitBreaker.recordErrorRequest();
            Logger.error(`当前id为${noomiRpcResponse.getRequestId()}的请求，被限流，响应码${noomiRpcResponse.getResponseType()}。`);
            throw new ResponseError(responseType, ResponseType.RATE_LIMIT_DESCRIPTION);
        }else if (responseType === ResponseType.RESOURCE_NOT_FOUND) {
            circuitBreaker.recordErrorRequest();
            Logger.error(`当前id为${noomiRpcResponse.getRequestId()}的请求，未找到目标资源，响应码${noomiRpcResponse.getResponseType()}。`);
            throw new ResponseError(responseType, ResponseType.RESOURCE_NOT_FOUND_DESCRIPTION);
        }else if (responseType === ResponseType.FAIL) {
            circuitBreaker.recordErrorRequest();
            Logger.error(`当前id为${noomiRpcResponse.getRequestId()}的请求，返回错误的结果，响应码${noomiRpcResponse.getResponseType()}。`);
            throw new ResponseError(responseType, ResponseType.FAIL_DESCRIPTION);
        }else if (responseType === ResponseType.BE_CLOSING) {
            Logger.error(`当前id为${noomiRpcResponse.getRequestId()}的请求，访问被拒绝，目标服务器正处于关闭中，响应码${noomiRpcResponse.getResponseType()}。`);
            GlobalCache.CHANNEL_CACHE.delete(serviceNode);
            const loadBalancer: LoadBalancer = LoadBalancerFactory.getLoadBalancer(Starter.getInstance().getConfiguration().loadBalancerType).impl;
            loadBalancer.reLoadBalance(noomiRpcResponse.getResponseBody().getServiceName(), [...GlobalCache.CHANNEL_CACHE.keys()])
            throw new ResponseError(responseType, ResponseType.BE_CLOSING_DESCRIPTION);
        }
    }
}
