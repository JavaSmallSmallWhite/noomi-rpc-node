import {InBoundHandler} from "../InBoundHandler";
import {NoomiRpcResponse} from "../../message/NoomiRpcResponse";
import {Socket} from "net";
import {ResponseType} from "../../enumeration/ResponseType";
import {Logger} from "../../common/logger/Logger";

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
        if (responseType === ResponseType.SUCCESS_HEART_BEAT) {
            Logger.debug(`已寻找到编号为${noomiRpcResponse.getRequestId()}的请求和响应，处理心跳检测，处理结果。`);
        } else if (responseType === ResponseType.SUCCESS_COMMON) {
            Logger.debug(`已寻找到编号为${noomiRpcResponse.getRequestId()}的请求和响应，处理结果。`);
            return Promise.resolve(noomiRpcResponse.getResponseBody().getReturnValue());
        }
    }
}
