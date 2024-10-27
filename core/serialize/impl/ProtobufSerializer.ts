import { Serializer } from "../Serializer";
import { GlobalCache } from "../../cache/GlobalCache";
import { SerializeError } from "../../common/error/SerializeError";
import { Logger } from "../../common/logger/Logger";
import { Application } from "../../common/utils/ApplicationUtil";
import { Root, Type } from "../../common/utils/TypesUtil";
import { ReferenceConfig } from "../../ReferenceConfig";
import { ServiceConfig } from "../../ServiceConfig";

/**
 * protobuf序列化器
 */
export class ProtobufSerializer implements Serializer {
  /**
   * protobuf反序列化
   * @param buffer 待反序列化的Buffer
   * @param type 描述对象
   */
  public async deserialize(buffer: Uint8Array, type: Type): Promise<unknown> {
    if (!buffer) {
      Logger.debug("反序列化时传入的Buffer流为空");
      return null;
    }
    try {
      const decodeMessage = type.decode(buffer);
      return type.toObject(decodeMessage);
    } catch (error) {
      throw new SerializeError(`protobuf反序列化失败：${error.message}`);
    }
  }

  /**
   * 获取serviceName的描述
   */
  public getServiceNameDescription(): Type {
    return new Application.protobuf.Type("StringMessage").add(
      new Application.protobuf.Field("serviceName", 10000, "string")
    );
  }

  /**
   * 获取methodName的描述
   */
  public getMethodNameDescription(): Type {
    return this.getServiceNameDescription().add(
      new Application.protobuf.Field("methodName", 10001, "string")
    );
  }

  /**
   * protobuf序列化
   * @param body 请求体或者响应体
   * @param type
   */
  public async serialize(body: unknown, type: Type): Promise<Uint8Array> {
    if (!body) {
      Logger.debug("序列化的请求体为空。");
      return null;
    }
    try {
      const message = type.create(body);
      return type.encode(message).finish();
    } catch (error) {
      throw new SerializeError(`protobuf序列化失败：${error.message}`);
    }
  }

  /**
   * 获取数据对应的描述
   * @param platform 端
   * @param serviceName 服务名称
   * @param methodName 方法名称
   * @param index 描述索引
   */
  public async getDataDescription(
    platform: "client" | "server",
    serviceName: string,
    methodName: string,
    index: number
  ): Promise<Type> {
    let config: ReferenceConfig<unknown> | ServiceConfig<unknown>;
    if (platform === "client") {
      config = GlobalCache.REFERENCES_LIST.get(serviceName);
    } else {
      config = GlobalCache.SERVICES_LIST.get(serviceName);
    }
    if (!config.protoFile || !config.protoServiceName) {
      throw new SerializeError("未配置proto文件或对象类型名或方法名或参数返回值标签名");
    }
    const protoFile: string = config.protoFile;
    const protoObjectName: string = config.protoServiceName;
    let root: Root = GlobalCache.PROTOBUF_ROOT_CACHE.get(protoFile);
    if (!root) {
      root = await Application.protobuf.load(protoFile);
      GlobalCache.PROTOBUF_ROOT_CACHE.set(protoFile, root);
    }
    const service = root.lookupService(protoObjectName);
    const resolve = index === 0 ? "requestType" : "responseType";
    return service.root.lookupType(service.methods[methodName][resolve]);
  }

  /**
   * 转换传输的对象，发起请求时传输的是tuple，protobuf序列化不能序列化tuple，需要自定义操作
   * @param payload 请求体或者响应体
   * @param config proto具体配置
   */
  // public async transformValue(
  //   payload: RequestPayload | ResponsePayload,
  //   config: ProtoConfig
  // ): Promise<unknown> {
  //   if (payload instanceof RequestPayload) {
  //     const argumentsList = payload.getArgumentsList();
  //     let root: Root;
  //     if (GlobalCache.PROTOBUF_ROOT_CACHE.has(config.protoFile)) {
  //       root = GlobalCache.PROTOBUF_ROOT_CACHE.get(config.protoFile);
  //     } else {
  //       root = await Application.protobuf.load(config.protoFile);
  //       GlobalCache.PROTOBUF_ROOT_CACHE.set(config.protoFile, root);
  //     }
  //     const type = root.lookupService(config.protoServiceName);
  //     const transformValue = {};
  //     const methodName = payload.getMethodName();
  //     const method = type.methods[methodName];
  //     if (!method) {
  //       throw new SerializeError(`proto文件中不存在${methodName}服务方法`);
  //     }
  //     const fieldsArray = type.root.lookupType(type.methods[methodName].requestType).fieldsArray;
  //     for (let i = 0; i < fieldsArray.length; i++) {
  //       transformValue[fieldsArray[i].name] = argumentsList[i];
  //     }
  //     return transformValue;
  //   }
  //   return payload.getReturnValue();
  // }
  /**
   * protobuf值转换
   * @param value 值
   * @param description proto类型
   * @param platform 端
   */
  public transformValue(value: unknown, description: Type, platform: "client" | "server"): unknown {
    if (platform === "client") {
      const args = Object.create(null);
      if (Array.isArray(value)) {
        value.forEach((element, index) => {
          args[description[index]] = element;
        });
      }
      return args;
    } else {
      return Object.values(value);
    }
  }
}
