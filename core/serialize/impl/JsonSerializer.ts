import { Serializer } from "../Serializer";
import { Logger } from "../../common/logger/Logger";
import { Application } from "../../common/utils/ApplicationUtil";
import { NoomiRpcError } from "../../common/error/NoomiRpcError";
import { TipManager } from "../../common/error/TipManager";

/**
 * Json序列化器
 */
export class JsonSerializer implements Serializer {
  /**
   * Json序列化
   * @param body 序列化内容
   */
  public async serialize(body: unknown | string): Promise<Uint8Array> {
    if (!body) {
      Logger.debug(TipManager.getError("0802"));
      return null;
    }
    try {
      const bodyJson = Application.json5.stringify(body);
      const bodyBuffer = Buffer.from(bodyJson);
      Logger.debug(TipManager.getTip("0139", bodyBuffer.length));
      return bodyBuffer;
    } catch (error) {
      throw new NoomiRpcError("0803", error.message);
    }
  }

  /**
   * Json反序列化
   * @param buffer 待反序列化的Buffer
   */
  public deserialize(buffer: Uint8Array): Promise<unknown | string> {
    if (!buffer) {
      Logger.debug(TipManager.getError("0800"));
      return null;
    }
    try {
      const bodyString = buffer.toString();
      const body = Application.json5.parse(bodyString);
      Logger.debug(TipManager.getTip("0138"));
      return body;
    } catch (error) {
      throw new NoomiRpcError("0801", error.message);
    }
  }
}
