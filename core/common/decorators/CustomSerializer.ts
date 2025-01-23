import { SerializerFactory } from "../../serialize/SerializerFactory";
import { ObjectWrapper } from "../../configuration/ObjectWrapper";
import { Serializer } from "../../serialize/Serializer";
import { NoomiRpcStarter } from "../../NoomiRpcStarter";
import { UnknownClass } from "../../configuration/ObjectWrapperType";

/**
 * 自定义添加序列化器的选项
 */
export interface SerializerOption {
  /**
   * 序列化器id，框架自带1号和2号序列化器，不可与框架自带的序列化器名称重复
   */
  serializerId: number;

  /**
   * 是否使用
   */
  isUse?: boolean;

  /**
   * 序列化器名称，不可与框架自带的序列化器名称重复
   */
  serializerName?: string;
}

/**
 * 序列化装饰器，用于添加自定义的序列化器，装饰类
 * @constructor
 */
export function CustomSerializer(
  serializerOption: SerializerOption
): (target: (...args: unknown[]) => void) => void {
  return (target: (...args: unknown[]) => void): void => {
    const serializerName: string = serializerOption["serializerName"] || target.name;
    SerializerFactory.addSerializer(
      new ObjectWrapper<Serializer>(
        serializerOption["serializerId"],
        serializerName,
        Reflect.construct(target, [])
      )
    );
    if (serializerOption["isUse"]) {
      NoomiRpcStarter.getInstance().getConfiguration().serializerType = serializerName;
    }
  };
}
