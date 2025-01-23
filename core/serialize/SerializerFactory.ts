import { Serializer } from "./Serializer";
import { ObjectWrapper } from "../configuration/ObjectWrapper";
import { JsonSerializer } from "./impl/JsonSerializer";
import { Logger } from "../common/logger/Logger";
import { FurySerializer } from "./impl/FurySerializer";
import { ObjectWrapperFactory } from "../configuration/ObjectWrapperFactory";
import { ObjectWrapperType, UnknownClass } from "../configuration/ObjectWrapperType";
import { InstanceFactory } from "noomi";
import { ProtobufSerializer } from "./impl/ProtobufSerializer";
import { MsgpackSerializer } from "./impl/MsgpackSerializer";
import { Application } from "../common/utils/ApplicationUtil";
import { InternalSerializerType, TypeDescription } from "../common/utils/TypesUtil";
import { NoomiRpcError } from "../common/error/NoomiRpcError";
import { TipManager } from "../common/error/TipManager";

/**
 * 序列化工厂
 */
export class SerializerFactory {
  /**
   * 序列化类型缓存器
   * @private
   */
  private static readonly SERIALIZER_CACHE: Map<string, ObjectWrapper<Serializer>> = new Map<
    string,
    ObjectWrapper<Serializer>
  >();

  /**
   * 序列化类型编号缓存器
   * @private
   */
  private static readonly SERIALIZER_CACHE_CODE: Map<number, ObjectWrapper<Serializer>> = new Map<
    number,
    ObjectWrapper<Serializer>
  >();

  /**
   * 类加载时就将所有的序列化器添加到缓存器中
   */
  static {
    InstanceFactory.addInstance(JsonSerializer, { singleton: true });
    InstanceFactory.addInstance(FurySerializer, { singleton: true });
    InstanceFactory.addInstance(ProtobufSerializer, { singleton: true });
    InstanceFactory.addInstance(MsgpackSerializer, { singleton: true });

    ObjectWrapperFactory.addObjectWrapperConfig("json", [1, "json", JsonSerializer]);
    ObjectWrapperFactory.addObjectWrapperConfig("fury", [2, "fury", FurySerializer]);
    ObjectWrapperFactory.addObjectWrapperConfig("protobuf", [3, "protobuf", ProtobufSerializer]);
    ObjectWrapperFactory.addObjectWrapperConfig("msgpack", [4, "msgpack", MsgpackSerializer]);

    // const jsonSerializer: ObjectWrapper<Serializer> = new ObjectWrapper<Serializer>(1, "json", new JsonSerializer());
    // const furySerializer: ObjectWrapper<Serializer> = new ObjectWrapper<Serializer>(2, "fury", new FurySerializer())
    //
    // this.SERIALIZER_CACHE.set("json", jsonSerializer);
    // this.SERIALIZER_CACHE.set("fury", furySerializer);
    //
    // this.SERIALIZER_CACHE_CODE.set(1, jsonSerializer);
    // this.SERIALIZER_CACHE_CODE.set(2, furySerializer);
  }

  /**
   * 使用工厂方法获取一个SerializerWrapper
   * @param serializerTypeOrCode 序列化类型或序列化码
   */
  public static getSerializer(serializerTypeOrCode: string | number): ObjectWrapper<Serializer> {
    if (typeof serializerTypeOrCode === "string") {
      const serializerObjectWrapper: ObjectWrapper<Serializer> =
        this.SERIALIZER_CACHE.get(serializerTypeOrCode);
      if (!serializerObjectWrapper) {
        Logger.error(TipManager.getError("0805", serializerTypeOrCode));
        return this.SERIALIZER_CACHE.get("json");
      }
      return serializerObjectWrapper;
    }
    if (typeof serializerTypeOrCode === "number") {
      const serializerObjectWrapper: ObjectWrapper<Serializer> =
        this.SERIALIZER_CACHE_CODE.get(serializerTypeOrCode);
      if (!serializerObjectWrapper) {
        Logger.error(TipManager.getError("0806", serializerTypeOrCode));
        return this.SERIALIZER_CACHE_CODE.get(1);
      }
      return serializerObjectWrapper;
    }
    Logger.error(TipManager.getError("0807"));
    return this.SERIALIZER_CACHE_CODE.get(1);
  }

  /**
   * 新增一个序列化器
   * @param serializerObjectWrapper 序列化wrapper
   */
  public static addSerializer(
    serializerObjectWrapper: ObjectWrapper<Serializer> | string
  ): ObjectWrapper<Serializer> {
    if (typeof serializerObjectWrapper === "string") {
      const serializerConfig: ObjectWrapperType =
        ObjectWrapperFactory.getObjectWrapperConfig(serializerObjectWrapper);
      serializerConfig[2] = <Serializer>(
        InstanceFactory.getInstance(<UnknownClass>serializerConfig[2])
      );
      const serializerWrapper: ObjectWrapper<Serializer> = <ObjectWrapper<Serializer>>(
        Reflect.construct(ObjectWrapper, serializerConfig)
      );
      this.SERIALIZER_CACHE.set(serializerConfig[1], serializerWrapper);
      this.SERIALIZER_CACHE_CODE.set(serializerConfig[0], serializerWrapper);
      return serializerWrapper;
    }
    if (this.SERIALIZER_CACHE_CODE.has(serializerObjectWrapper.code)) {
      throw new NoomiRpcError("0808", serializerObjectWrapper.code);
    }
    if (this.SERIALIZER_CACHE.has(serializerObjectWrapper.name)) {
      throw new NoomiRpcError("0809", serializerObjectWrapper.name);
    }
    this.SERIALIZER_CACHE.set(serializerObjectWrapper.name, serializerObjectWrapper);
    this.SERIALIZER_CACHE_CODE.set(serializerObjectWrapper.code, serializerObjectWrapper);
    return serializerObjectWrapper;
  }

  /**
   * 根据data动态生成描述
   * @param data 数据
   * @param tag 标签
   */
  public static genDataDescription(
    data: unknown,
    tag: string
  ): {
    options?: {
      inner?: TypeDescription[];
      key?: TypeDescription;
      value?: TypeDescription;
      props?: {
        [key: string]: any;
      };
      tag?: string;
    };
    label: string;
    type: InternalSerializerType;
  } {
    if (data === null || data === undefined) {
      return null;
    }
    if (Array.isArray(data)) {
      // todo 单一类型元素的数组和元组的description暂时没有很好的办法区分
      //  let obj: Tuple =  [1, 2, 3]
      const descriptionArray: TypeDescription[] = [];
      for (const item of data) {
        const description: TypeDescription = this.genDataDescription(item, tag);
        descriptionArray.push(description);
      }
      if (descriptionArray.length === 0) {
        throw new NoomiRpcError("0001");
      }
      return {
        type: Application.fury.InternalSerializerType.TUPLE,
        label: "tuple",
        options: {
          inner: descriptionArray
        }
      };
    }
    if (data instanceof Date) {
      return {
        type: Application.fury.InternalSerializerType.TIMESTAMP,
        label: "timestamp"
      };
    }
    if (typeof data === "string") {
      return {
        type: Application.fury.InternalSerializerType.STRING,
        label: "string"
      };
    }
    if (data instanceof Set) {
      return {
        type: Application.fury.InternalSerializerType.SET,
        label: "set",
        options: {
          key: this.genDataDescription([...data.values()][0], tag)
        }
      };
    }
    if (data instanceof Map) {
      return {
        type: Application.fury.InternalSerializerType.MAP,
        label: "map",
        options: {
          key: this.genDataDescription([...data.keys()][0], tag),
          value: this.genDataDescription([...data.values()][0], tag)
        }
      };
    }
    if (typeof data === "boolean") {
      return {
        type: Application.fury.InternalSerializerType.BOOL,
        label: "boolean"
      };
    }
    if (typeof data === "number") {
      if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
        return {
          type: Application.fury.InternalSerializerType.INT64,
          label: "int64"
        };
      }
      return {
        type: Application.fury.InternalSerializerType.INT32,
        label: "int32"
      };
    }
    if (typeof data === "object") {
      return {
        type: Application.fury.InternalSerializerType.OBJECT,
        label: "object",
        options: {
          props: Object.fromEntries(
            Object.entries(data)
              .map(([key, value]): [string, unknown] => {
                return [key, this.genDataDescription(value, `${tag}.${key}`)];
              })
              .filter(([, v]) => Boolean(v))
          ),
          tag
        }
      };
    }
    throw new NoomiRpcError("0002", typeof data);
  }

  /**
   * 序列化请求体
   * @param serializer 序列化器
   * @param payload 请求体
   * @param platformMark 客户端和服务端对应的配置
   * @param headerBuffer 请求头的流
   * @param index 索引
   */
  // public static async payloadSerialize(
  //   serializer: Serializer,
  //   payload: RequestPayload | ResponsePayload,
  //   platformMark: "client" | "server.js",
  //   headerBuffer: Buffer,
  //   index: number
  // ): Promise<Uint8Array> {
  //   // 获取serviceName methodName
  //   const serviceName = payload.getServiceName();
  //   const methodName = payload.getMethodName();
  //   // 获取config
  //   const config = this.getConfig(platformMark, serviceName);
  //   // 获取description
  //   const transformValueMark = platformMark === "client" ? "arguments" : "returnValue";
  //   let description: unknown;
  //   if (serializer.getDescription) {
  //     const dataDescription = serializer.getDescription(config, methodName, transformValueMark);
  //     const tag = NoomiRpcStarter.getInstance().getConfiguration().idGenerator.getId().toString();
  //     description = Type.object(tag, {
  //       ...errorMessage,
  //       ...tokenMessage,
  //       ...dataDescription
  //     });
  //   } else {
  //     description = null;
  //   }
  //   // 获取传输对象
  //   let transformValue: unknown;
  //   if (serializer.transformValue) {
  //     transformValue = await serializer.transformValue(payload, description);
  //   } else {
  //     transformValue =
  //       payload instanceof RequestPayload ? payload.getArgumentsList() : payload.getReturnValue();
  //   }
  //   // 序列化serviceName methodName argumentsList
  //   const serviceNameBuffer = await serializer.serialize(serviceName);
  //   const methodNameBuffer = await serializer.serialize(methodName);
  //   let resultBuffer: Uint8Array;
  //   if (transformValue) {
  //     resultBuffer = await serializer.serialize(transformValue, description);
  //   }
  //   // 写入请求头 serviceNameBuffer的大小
  //   headerBuffer.writeUInt16BE(serviceNameBuffer.length, index);
  //   index += MessageConstant.SERVICE_NAME_SIZE_FIELD_LENGTH;
  //   // 写入请求头 methodNameBuffer的大小
  //   headerBuffer.writeUInt16BE(methodNameBuffer.length, index);
  //   return Buffer.concat([serviceNameBuffer, methodNameBuffer, resultBuffer]);
  // }

  /**
   * 反序列化请求体
   * @param serializer 序列化器
   * @param buffer 请求体流
   * @param platformMark 平台标记
   * @param serviceNameSize 服务名称大小
   * @param methodNameSize 方法名称大小
   * @param payload 负载
   */
  // public static async payloadDeserialize(
  //   serializer: Serializer,
  //   buffer: Uint8Array,
  //   platformMark: "client" | "server.js",
  //   serviceNameSize: number,
  //   methodNameSize: number,
  //   payload: RequestPayload | ResponsePayload
  // ): Promise<RequestPayload | ResponsePayload> {
  //   // 截取serviceName buffer
  //   const serviceNameBuffer = buffer.subarray(0, serviceNameSize);
  //   // 截取methodName buffer
  //   const methodNameBuffer = buffer.subarray(serviceNameSize, serviceNameSize + methodNameSize);
  //   // 截取argumentsList buffer
  //   const resultBuffer = buffer.subarray(serviceNameSize + methodNameSize);
  //   // 反序列化为serviceName
  //   const serviceName = <string>await serializer.deserialize(serviceNameBuffer);
  //   // 反序列化为methodName
  //   const methodName = <string>await serializer.deserialize(methodNameBuffer);
  //   // 获取config
  //   const config = this.getConfig(platformMark, serviceName);
  //   // 获取description
  //   const transformValueMark = platformMark === "client" ? "returnValue" : "arguments";
  //   let description: unknown;
  //   if (serializer.getDescription) {
  //     description = serializer.getDescription(config, methodName, transformValueMark);
  //   } else {
  //     description = {};
  //   }
  //   const result = await serializer.deserialize(resultBuffer, description);
  //   if (payload instanceof RequestPayload) {
  //     payload.setServiceName(serviceName);
  //     payload.setMethodName(methodName);
  //     payload.setArgumentsList(<unknown[]>result);
  //   } else {
  //     payload.setServiceName(serviceName);
  //     payload.setMethodName(methodName);
  //     payload.setReturnValue(result);
  //   }
  //   return payload;
  // }

  /**
   * 获取config
   * @param platformMark 服务端客户端标记
   * @param serviceName 服务名称
   * @private
   */
  // private static getConfig(
  //   platformMark: "client" | "server.js",
  //   serviceName: string
  // ): ReferenceConfig<unknown> | ServiceConfig<unknown> {
  //   if (platformMark === "client") {
  //     return GlobalCache.REFERENCES_LIST.get(serviceName);
  //   }
  //   return GlobalCache.SERVICES_LIST.get(serviceName);
  // }
}
