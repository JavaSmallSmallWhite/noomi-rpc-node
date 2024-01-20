import {Socket} from "net";
import {Handler} from "./Handler";

/**
 * 入栈处理程序
 */
export abstract class InBoundHandler<T, V> implements Handler {

    /**
     * 入栈处理启动器
     * @param socketChannel socket通道
     * @param requestOrResponse 请求或者响应
     */
    public async process(socketChannel: Socket, requestOrResponse: T): Promise<V> {
        return this.handle(socketChannel, <T>requestOrResponse);
    }

    /**
     * 请求处理并转换为响应
     * @param socketChannel socket通道
     * @param requestOrResponse 请求或响应
     */
    protected abstract handle(socketChannel: Socket, requestOrResponse: T): Promise<V>;
}
