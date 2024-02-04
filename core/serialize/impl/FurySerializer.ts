import {Serializer} from "../Serializer";
import Fury, {InternalSerializerType, TypeDescription} from '@furyjs/fury';
import {Logger} from "../../common/logger/Logger";
import {SerializeError} from "../../common/error/SerializeError";
import {RequestPayload} from "../../message/RequestPayload";
import {ResponsePayload} from "../../message/ResponsePayload";
import {GlobalCache} from "../../cache/GlobalCache";
const hps = null;
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
    public deserialize(buffer: Uint8Array, serializeDescription: TypeDescription): RequestPayload | ResponsePayload {
        if (!buffer) {
            Logger.debug("反序列化时传入的Buffer流为空，或者反序列化后指定的目标类为空");
            return null;
        }
        try {
            const descriptionId = serializeDescription["options"]["tag"];
            let body: RequestPayload | ResponsePayload;
            if (GlobalCache.DESCRIPTION_SERIALIZER_LIST.has(descriptionId)) {
                body = <RequestPayload | ResponsePayload>GlobalCache.DESCRIPTION_SERIALIZER_LIST
                    .get(descriptionId)(buffer);
            } else {
                const {deserialize} = this.fury.registerSerializer(serializeDescription);
                body = <RequestPayload | ResponsePayload>deserialize(buffer);
                GlobalCache.DESCRIPTION_SERIALIZER_LIST.set(descriptionId, deserialize);
            }
            Logger.debug("反序列化操作完成。");
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
    public serialize(body: RequestPayload | ResponsePayload, serializeDescription: TypeDescription): Uint8Array {
        if (!body) {
            Logger.debug("序列化的请求体为空。");
            return null;
        }
        try {
            const descriptionId = serializeDescription["options"]["tag"];
            let bodyBuffer: Uint8Array;
            if (GlobalCache.DESCRIPTION_SERIALIZER_LIST.has(descriptionId)) {
                bodyBuffer = <Uint8Array>GlobalCache.DESCRIPTION_SERIALIZER_LIST.get(descriptionId)(body);
            } else {
                const {serialize} = this.fury.registerSerializer(serializeDescription);
                bodyBuffer = serialize(body);
                GlobalCache.DESCRIPTION_SERIALIZER_LIST.set(descriptionId, serialize);
            }
            Logger.debug(`requestPayload请求体已经完成了序列化操作，序列化后的字节数位${bodyBuffer.length}`);
            return bodyBuffer;
        } catch (error) {
            Logger.error("requestPayload请求体的fury序列化操作失败。");
            throw new SerializeError(error.message);
        }
    }

    /**
     * 根据data动态获取描述
     * @param data 数据
     * @param tag 标签
     */
    private getDataDescription(data: unknown, tag: string): {
        options?: {
            inner?: TypeDescription,
            key?: TypeDescription,
            value?: TypeDescription,
            props?: {
                [key: string]: any;
            },
            tag?: string
        };
        label: string;
        type: InternalSerializerType
    } {
        if (data === null || data === undefined) {
            return null;
        }
        if (Array.isArray(data)) {
            const item: TypeDescription = this.getDataDescription(data[0], tag);
            if (!item) {
                throw new Error('empty array can\'t convert')
            }
            return {
                type: InternalSerializerType.ARRAY,
                label: 'array',
                options: {
                    inner: item,
                }
            }
        }
        if (data instanceof Date) {
            return {
                type: InternalSerializerType.TIMESTAMP,
                label: 'timestamp'
            }
        }
        if (typeof data === 'string') {
            return {
                type: InternalSerializerType.STRING,
                label: "string",
            }
        }
        if (data instanceof Set) {
            return {
                type: InternalSerializerType.FURY_SET,
                label: "set",
                options: {
                    key: this.getDataDescription([...data.values()][0], tag),
                }
            }
        }
        if (data instanceof Map) {
            return {
                type: InternalSerializerType.MAP,
                label: "map",
                options: {
                    key: this.getDataDescription([...data.keys()][0], tag),
                    value: this.getDataDescription([...data.values()][0], tag),
                }
            }
        }
        if (typeof data === 'boolean') {
            return {
                type: InternalSerializerType.BOOL,
                label: "boolean",
            }
        }
        if (typeof data === 'number') {
            if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
                return {
                    type: InternalSerializerType.INT64,
                    label: "int64"
                }
            }
            return {
                type: InternalSerializerType.INT32,
                label: "int32"
            }
        }
        if (typeof data === 'object') {
            return {
                type: InternalSerializerType.FURY_TYPE_TAG,
                label: "object",
                options: {
                    props: Object.fromEntries(Object.entries(data).map(([key, value]): [string, unknown] => {
                        return [key, this.getDataDescription(value, `${tag}.${key}`)]
                    }).filter(([_, v]) => Boolean(v))),
                    tag
                }

            }
        }
        throw `unknown data type ${typeof data}`
    }
}
