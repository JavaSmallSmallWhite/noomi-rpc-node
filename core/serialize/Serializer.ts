import {RequestPayload} from "../message/RequestPayload";
import {ResponsePayload} from "../message/ResponsePayload";

/**
 * 序列化器
 */
export interface Serializer {
    /**
     * 抽象的用来做序列化的方法
     * @param body 序列化内容
     * @param serializeDescription 序列化描述，json序列化不需要，fury序列化需要
     */
    serialize(body: RequestPayload | ResponsePayload | string, serializeDescription?: unknown): Uint8Array;

    /**
     * 抽象的用来做反序列化的方法
     * @param buffer 待反序列化的Buffer
     * @param serializeDescription 序列化描述，json序列化不需要，fury序列化需要
     */
    deserialize(buffer: Uint8Array, serializeDescription?: unknown): RequestPayload | ResponsePayload | string;
}

/**
 * description
 */
export interface Description {
    /**
     * description字符串
     */
    descriptionString: string,

    /**
     * 序列化方法
     */
    serializerFunction: Function
}
