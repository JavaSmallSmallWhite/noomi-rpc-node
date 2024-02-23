import {AsyncLocalStorage} from "async_hooks";
import {NoomiRpcRequest} from "../message/NoomiRpcRequest";
import {ServiceConfig} from "../ServiceConfig";
import {ReferenceConfig} from "../ReferenceConfig";
import {Socket} from "net";
import {Registry} from "../registry/Registry";
import {Description} from "../serialize/Serializer";

/**
 * 全局缓存
 */
export class GlobalCache {

    /**
     * 注册中心服务配置
     */
    public static serviceConfiguration: unknown = {};

    /**
     * 注册中心缓存器
     * @private
     */
    public static readonly REGISTRY_CACHE: Map<string, Registry> = new Map<string, Registry>();

    /**
     * 异步线程存储器
     */
    public static readonly localStorage: AsyncLocalStorage<NoomiRpcRequest> = new AsyncLocalStorage<NoomiRpcRequest>()

    /**
     * 维护已经发布且暴露的服务列表 key -> 服务名 value -> ServiceConfig
     */
    public static readonly SERVICES_LIST: Map<string, ServiceConfig<Object>> = new Map<string, ServiceConfig<Object>>();

    /**
     * 维护fury的description id key -> 服务+方法  value -> id数组
     */
    public static readonly DESCRIPTION_LIST: Map<string, string[]> = new Map<string, string[]>();

    /**
     * 维护fury序列化方法 key -> description id   value -> Description
     */
    public static readonly DESCRIPTION_SERIALIZER_LIST: Map<string, Description> = new Map<string, Description>();

    /**
     * 维护已经配置好的代理对象 key -> 服务名 value -> ReferenceConfig
     */
    public static readonly REFERENCES_LIST: Map<string, ReferenceConfig<Object>> = new Map<string, ReferenceConfig<Object>>();

    /**
     * 连接的缓存 服务节点的地址端口 -> channel
     */
    public static readonly CHANNEL_CACHE: Map<string, Socket> = new Map<string, Socket>();

    /**
     * 最短响应时间的连接缓存
     */
    public static readonly ANSWER_TIME_CHANNEL_CACHE: Map<bigint, Socket> = new Map<bigint, Socket>();
}
