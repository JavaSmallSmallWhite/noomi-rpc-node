import { Handler } from "./Handler";
import { Socket } from "../common/utils/TypesUtil";

/**
 * 流转换成消息解码器
 */
export abstract class BufferToMessageDecoderHandler<T> implements Handler {
  /**
   * 解码器启动程序
   * @param socketChannel socket通道
   * @param requestOrResponseBuffer 请求或者响应数据流
   */
  public async process(socketChannel: Socket, requestOrResponseBuffer: Buffer): Promise<T> {
    return await this.decode(socketChannel, requestOrResponseBuffer);
  }

  /**
   * 请求流或响应流解码
   * @param socketChannel 通道
   * @param requestOrResponseBuffer 请求报文流或响应报文流
   */
  protected abstract decode(socketChannel: Socket, requestOrResponseBuffer: Buffer): Promise<T>;
}
