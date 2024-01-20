import {Serializer} from "./Serializer";
import {ObjectWrapper} from "../config/ObjectWrapper";
import {JsonSerializer} from "./impl/JsonSerializer";
import {Logger} from "../common/logger/Logger";
import {FurySerializer} from "./impl/FurySerializer";
import {Type, TypeDescription} from "@furyjs/fury";
import {SerializeError} from "../common/error/SerializeError";
import {DescriptionType, ServiceConfig} from "../ServiceConfig";
import {ReferenceConfig} from "../ReferenceConfig";
import {GlobalCache} from "../cache/GlobalCache";
import {Starter} from "../index";

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
        this.SERIALIZER_CACHE.set(serializerObjectWrapper.name, serializerObjectWrapper);
        this.SERIALIZER_CACHE_CODE.set(serializerObjectWrapper.code, serializerObjectWrapper);
    }

    /**
     * 获取consumer端的序列化解释
     * @param descriptionId 描述id
     * @param argumentsOrReturnValueDescription 参数解释或者返回值解释
     */
    public static getReferenceSerializeDescription(descriptionId: bigint, argumentsOrReturnValueDescription: string): TypeDescription {
        if (Starter.getInstance().getConfiguration().serializerType === "fury") {
            const interfaceDescription: DescriptionType = GlobalCache.DESCRIPTION_LIST
                .get(String(descriptionId));
            const referenceConfig: ReferenceConfig<Object, Object> = GlobalCache.REFERENCES_LIST
                .get(interfaceDescription.serviceName);
            const furyType: TypeDescription = referenceConfig
                .interfaceDescription[interfaceDescription.methodName]()[argumentsOrReturnValueDescription];
            if (!furyType) {
                throw new SerializeError("未配置fury的参数序列化类型或者返回值序列化类型。");
            }
            return argumentsOrReturnValueDescription === "argumentsDescription" ? Type.object(String(descriptionId), {
                serviceName: Type.string(),
                methodName: Type.string(),
                argumentsList: furyType
            }): Type.object(String(interfaceDescription.methodId2), {
                serviceName: Type.string(),
                methodName: Type.string(),
                returnValue: furyType
            })
        }
    }

    /**
     * 获取provider的序列化解释
     * @param descriptionId 描述id
     * @param argumentsOrReturnValueDescription 两个类别，参数解释或者返回值解释
     */
    public static getServiceSerializeDescription(descriptionId: bigint, argumentsOrReturnValueDescription: string): TypeDescription {
        if (Starter.getInstance().getConfiguration().serializerType === "fury") {
            const interfaceDescription: DescriptionType = GlobalCache.DESCRIPTION_LIST
                .get(String(descriptionId));
            const serviceConfig: ServiceConfig<Object, Object> = GlobalCache.SERVICES_LIST
                .get(interfaceDescription.serviceName);
            const furyType: TypeDescription = serviceConfig.interfaceDescription[interfaceDescription.methodName]()[argumentsOrReturnValueDescription];
            if (!furyType) {
                throw new SerializeError("未配置fury的参数序列化类型或者返回值序列化类型。");
            }
            return argumentsOrReturnValueDescription === "argumentsDescription" ?
                Type.object(String(interfaceDescription.methodId2), {
                serviceName: Type.string(),
                methodName: Type.string(),
                argumentsList: furyType
            }): Type.object(String(descriptionId), {
                serviceName: Type.string(),
                methodName: Type.string(),
                returnValue: furyType
            })
        }
    }
}
