import { Serializer } from "../Serializer";
import { Logger } from "../../common/logger/Logger";
import { Application } from "../../common/utils/ApplicationUtil";
import { SerializeError } from "../../common/error/SerializeError";

/**
 * msgpack序列化器
 */
export class MsgpackSerializer implements Serializer {
  /**
   * msgpack序列化
   * @param body 序列化内容
   */
  public async serialize(body: unknown | string): Promise<Uint8Array> {
    if (!body) {
      Logger.debug("序列化的请求体为空。");
      return null;
    }
    try {
      const buffer = Application.msgpack.encode(body);
      Logger.debug(`requestPayload请求体已经完成了序列化操作，序列化后的字节数位${buffer.length}`);
      return buffer;
    } catch (error) {
      Logger.error("requestPayload请求体的msgpack序列化操作失败。");
      throw new SerializeError(error.message);
    }
  }
  /**
   * msgpack反序列化
   * @param buffer 待反序列化的Buffer
   */
  public async deserialize(buffer: Uint8Array): Promise<unknown | string> {
    if (!buffer) {
      Logger.debug("反序列化时传入的Buffer流为空。");
      return null;
    }
    try {
      const body = Application.msgpack.decode(buffer);
      Logger.debug("反序列化操作完成。");
      return body;
    } catch (error) {
      Logger.error(`${buffer}流的msgpack反序列化操作失败。`);
      throw new SerializeError(error.message);
    }
  }
}
