import { RequestPayload } from "../message/RequestPayload";
import { ResponsePayload } from "../message/ResponsePayload";

/**
 * 序列化器
 */
export interface Serializer {
  /**
   * 抽象的用来做序列化的方法
   * @param body 序列化内容
   * @param serializeDescription 序列化描述
   */
  serialize(body: unknown | string, serializeDescription?: unknown): Promise<Uint8Array>;

  /**
   * 抽象的用来做反序列化的方法
   * @param buffer 待反序列化的Buffer
   * @param serializeDescription 序列化描述
   */
  deserialize(
    buffer: Uint8Array,
    serializeDescription?: unknown | "StringMessage"
  ): Promise<unknown | string>;

  /**
   * 获取serviceName描述
   */
  getServiceNameDescription?(): unknown;

  /**
   * 获取method描述
   */
  getMethodNameDescription?(): unknown;

  /**
   * 获取数据对应的描述
   * @param platform 端
   * @param serviceName 服务名称
   * @param methodName 方法名称
   * @param index 类型索引
   */
  getDataDescription?(
    platform: "client" | "server",
    serviceName: string,
    methodName: string,
    index: number
  ): unknown;

  /**
   * 值转换
   * @param platform 端
   * @param value 传输值
   * @param description 序列化对应描述
   */
  transformValue?(value: unknown, description: unknown, platform?: "client" | "server"): unknown;
}
