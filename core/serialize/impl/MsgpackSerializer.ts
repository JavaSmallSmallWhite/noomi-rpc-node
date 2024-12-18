import { Serializer } from "../Serializer";
import { Logger } from "../../common/logger/Logger";
import { Application } from "../../common/utils/ApplicationUtil";
import { NoomiRpcError } from "../../common/error/NoomiRpcError";
import { TipManager } from "../../common/error/TipManager";

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
      Logger.debug(TipManager.getError("0802"));
      return null;
    }
    try {
      const buffer = Application.msgpack.encode(body);
      Logger.debug(TipManager.getTip("0139", buffer.length));
      return buffer;
    } catch (error) {
      throw new NoomiRpcError("0803", error.message);
    }
  }
  /**
   * msgpack反序列化
   * @param buffer 待反序列化的Buffer
   */
  public async deserialize(buffer: Uint8Array): Promise<unknown | string> {
    if (!buffer) {
      Logger.debug(TipManager.getError("0800"));
      return null;
    }
    try {
      const body = Application.msgpack.decode(buffer);
      Logger.debug(TipManager.getTip("0138"));
      return body;
    } catch (error) {
      throw new NoomiRpcError("0801", error.message);
    }
  }
}
