import { Serializer } from "../Serializer";
import { Logger } from "../../common/logger/Logger";
import { SerializeError } from "../../common/error/SerializeError";
import { Fury, Hps, TypeDescription } from "../../common/utils/TypesUtil";
import { Application } from "../../common/utils/ApplicationUtil";
import { ReferenceConfig } from "../../ReferenceConfig";
import { ServiceConfig } from "../../ServiceConfig";
import { GlobalCache } from "../../cache/GlobalCache";
import { Type } from "@furyjs/fury";

/**
 * hps
 */
const hps: Hps = null;

/**
 * fury序列化器
 */
export class FurySerializer implements Serializer {
  /**
   * fury
   * @private
   */
  private fury: Fury = Reflect.construct(Application.fury.default, [{ hps }]);

  /**
   * fury反序列化
   * @param buffer 待反序列化的Buffer
   * @param serializeDescription 序列化描述，json序列化不需要
   */
  public async deserialize(
    buffer: Uint8Array,
    serializeDescription?: TypeDescription
  ): Promise<unknown | string> {
    if (!buffer) {
      Logger.debug("反序列化时传入的Buffer流为空，或者反序列化后指定的目标类为空");
      return null;
    }
    try {
      if (!serializeDescription) {
        const descriptionString: string = this.fury.deserialize(buffer);
        Logger.debug("description反序列化操作完成。");
        return descriptionString;
      }
      const { deserialize } = this.fury.registerSerializer(serializeDescription);
      const body = deserialize(buffer);
      Logger.debug("请求体反序列化操作完成。");
      return body;
    } catch (error) {
      Logger.error(`${buffer}流的fury反序列化操作失败。`);
      throw new SerializeError(error.message);
    }
  }

  /**
   * fury序列化
   * @param body 序列化内容
   * @param serializeDescription 序列化描述，json序列化不需要
   */
  public async serialize(
    body: unknown,
    serializeDescription: TypeDescription
  ): Promise<Uint8Array> {
    if (!body) {
      Logger.debug("序列化的请求体为空。");
      return null;
    }
    try {
      const { serialize } = this.fury.registerSerializer(serializeDescription);
      const bodyBuffer = serialize(body);
      Logger.debug(`序列化成功，序列化后的字节数位${bodyBuffer.length}`);
      return bodyBuffer;
    } catch (error) {
      Logger.error("fury序列化操作失败。");
      throw new SerializeError(error.message);
    }
  }

  /**
   * 获取服务名称描述
   */
  public getServiceNameDescription(): TypeDescription {
    return Type.string();
  }

  /**
   * 获取方法名称描述
   */
  public getMethodNameDescription(): TypeDescription {
    return Type.string();
  }

  /**
   * 获取数据对应的描述
   * @param platform 端
   * @param serviceName 服务名称
   * @param methodName 方法名称
   * @param index 类型索引
   */
  public getDataDescription(
    platform: "client" | "server",
    serviceName: string,
    methodName: string,
    index: number
  ): TypeDescription {
    let config: ReferenceConfig<unknown> | ServiceConfig<unknown>;
    if (platform === "client") {
      config = GlobalCache.REFERENCES_LIST.get(serviceName);
    } else {
      config = GlobalCache.SERVICES_LIST.get(serviceName);
    }
    return config.descriptionClass[methodName]()[index];
  }
}
