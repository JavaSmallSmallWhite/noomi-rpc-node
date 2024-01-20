import {Socket} from "net";
import {Handler} from "./Handler";

/**
 * 消息转换为流编码器
 */
export abstract class MessageToBufferEncoderHandler<T> implements Handler {

    /**
     * 编码器启动函数
     * @param socketChannel socket通道
     * @param requestOrResponse 请求或者响应
     */
    public async process(socketChannel: Socket, requestOrResponse: T): Promise<void> {
        const encodeBuffer: Buffer = await this.encode(socketChannel, requestOrResponse);
        socketChannel.write(encodeBuffer);
    }

    /**
     * 请求编码
     * @param socketChannel socket通道
     * @param requestOrResponse 请求或响应
     */
    protected abstract encode(socketChannel: Socket, requestOrResponse: T): Promise<Buffer>;
}

