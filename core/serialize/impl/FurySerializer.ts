import {Serializer} from "../Serializer";
import Fury, {TypeDescription} from '@furyjs/fury';
import {Logger} from "../../common/logger/Logger";
import {SerializeError} from "../../common/error/SerializeError";
import {RequestPayload} from "../../message/RequestPayload";
import {ResponsePayload} from "../../message/ResponsePayload";
import {Hps} from "@furyjs/fury/dist/lib/type";
const hps: Hps = null;
/**
 * fury序列化器
 */
export class FurySerializer implements Serializer{
    /**
     * fury
     * @private
     */
    private fury: Fury = new Fury({hps});

    /**
     * fury反序列化
     * @param buffer 待反序列化的Buffer
     * @param serializeDescription 序列化方式，json序列化不需要
     */
    public deserialize(buffer: Uint8Array, serializeDescription?: TypeDescription): RequestPayload | ResponsePayload | string {
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
            let body: RequestPayload | ResponsePayload;
            const {deserialize} = this.fury.registerSerializer(serializeDescription);
            body = <RequestPayload | ResponsePayload>deserialize(buffer);
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
     * @param serializeDescription 序列化方式，json序列化不需要
     */
    public serialize(body: RequestPayload | ResponsePayload | string, serializeDescription?: TypeDescription): Uint8Array {
        if (!body) {
            Logger.debug("序列化的请求体为空。");
            return null;
        }
        try {
            let bodyBuffer: Uint8Array;
            if (!serializeDescription && typeof body === "string") {
                bodyBuffer = this.fury.serialize(body);
                Logger.debug(`requestPayload或者responseBody的description已经完成了序列化操作，序列化后的字节数位${bodyBuffer.length}`);
                return bodyBuffer;
            }
            const {serialize} = this.fury.registerSerializer(serializeDescription);
            bodyBuffer = serialize(body);
            Logger.debug(`requestPayload或者responseBody请求体已经完成了序列化操作，序列化后的字节数位${bodyBuffer.length}`);
            return bodyBuffer;
        } catch (error) {
            Logger.error("requestPayload | responseBody请求体的fury序列化操作失败。");
            throw new SerializeError(error.message);
        }
    }
}
