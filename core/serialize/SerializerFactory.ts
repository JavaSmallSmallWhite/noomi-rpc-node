import {Serializer} from "./Serializer";
import {ObjectWrapper} from "../configuration/ObjectWrapper";
import {JsonSerializer} from "./impl/JsonSerializer";
import {Logger} from "../common/logger/Logger";
import {FurySerializer} from "./impl/FurySerializer";
import {InternalSerializerType, TypeDescription} from "@furyjs/fury";
import {SerializeError} from "../common/error/SerializeError";

/**
 * 序列化工厂
 */
export class SerializerFactory {
    /**
     * 序列化类型缓存器
     * @private
     */
    private static readonly SERIALIZER_CACHE: Map<string, ObjectWrapper<Serializer>> = new Map<string, ObjectWrapper<Serializer>>();

    /**
     * 序列化类型编号缓存器
     * @private
     */
    private static readonly SERIALIZER_CACHE_CODE: Map<number, ObjectWrapper<Serializer>> = new Map<number, ObjectWrapper<Serializer>>();

    /**
     * 类加载时就将所有的序列化器添加到缓存器中
     */
    static {
        const jsonSerializer: ObjectWrapper<Serializer> = new ObjectWrapper<Serializer>(1, "json", new JsonSerializer());
        const furySerializer: ObjectWrapper<Serializer> = new ObjectWrapper<Serializer>(2, "fury", new FurySerializer())

        this.SERIALIZER_CACHE.set("json", jsonSerializer);
        this.SERIALIZER_CACHE.set("fury", furySerializer);

        this.SERIALIZER_CACHE_CODE.set(1, jsonSerializer);
        this.SERIALIZER_CACHE_CODE.set(2, furySerializer);
    }

    /**
     * 使用工厂方法获取一个SerializerWrapper
     * @param serializerTypeOrCode 序列化类型或序列化码
     */
    public static getSerializer(serializerTypeOrCode: string | number): ObjectWrapper<Serializer> {
        if (typeof serializerTypeOrCode === "string") {
            const serializerObjectWrapper: ObjectWrapper<Serializer> = this.SERIALIZER_CACHE.get(serializerTypeOrCode);
            if (!serializerObjectWrapper) {
                Logger.error(`未找到您配置的${serializerTypeOrCode}序列化器，默认选用1号json的序列化器。`)
                return this.SERIALIZER_CACHE.get("json");
            }
            return serializerObjectWrapper;
        }
        if (typeof serializerTypeOrCode === "number") {
            const serializerObjectWrapper: ObjectWrapper<Serializer> = this.SERIALIZER_CACHE_CODE.get(serializerTypeOrCode);
            if (!serializerObjectWrapper) {
                Logger.error(`未找到您配置的编号为${serializerTypeOrCode}的序列化器，默认选用1号json的负载均衡器。`)
                return this.SERIALIZER_CACHE_CODE.get(1);
            }
            return serializerObjectWrapper;
        }
        Logger.error("不存在您所指定的序列化类型或序列化码，默认选用1号json的序列化器。");
        return this.SERIALIZER_CACHE_CODE.get(1);

    }

    /**
     * 新增一个序列化器
     * @param serializerObjectWrapper 序列化wrapper
     */
    public static addLoadBalancer(serializerObjectWrapper: ObjectWrapper<Serializer>): void {
        if (this.SERIALIZER_CACHE_CODE.has(serializerObjectWrapper.code) ) {
            throw new SerializeError(`编号为${serializerObjectWrapper.code}的序列化器已存在，请使用其他编号。`);
        }
        if (this.SERIALIZER_CACHE.has(serializerObjectWrapper.name) ) {
            throw new SerializeError(`序列化名称为${serializerObjectWrapper.name}的序列化器已存在，请使用其他名称。`);
        }
        this.SERIALIZER_CACHE.set(serializerObjectWrapper.name, serializerObjectWrapper);
        this.SERIALIZER_CACHE_CODE.set(serializerObjectWrapper.code, serializerObjectWrapper);
    }

    /**
     * 根据data动态获取描述
     * @param data 数据
     * @param tag 标签
     */
    public static getDataDescription(data: unknown, tag: string): {
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
