import {AsyncLocalStorage} from "async_hooks";
import {NoomiRpcRequest} from "../message/NoomiRpcRequest";
import {DescriptionType, ServiceConfig} from "../ServiceConfig";
import {ReferenceConfig} from "../ReferenceConfig";
import {Socket} from "net";

/**
 * 全局缓存
 */
export class GlobalCache {

    /**
     * 注册中心配置
     */
    public static serviceConfiguration: unknown;
    /**
     * 异步线程存储器
     */
    public static readonly localStorage: AsyncLocalStorage<NoomiRpcRequest> = new AsyncLocalStorage<NoomiRpcRequest>()

    /**
     * 维护已经发布且暴露的服务列表 key -> 服务名 value -> ServiceConfig
     */
    public static readonly SERVICES_LIST: Map<string, ServiceConfig<Object, Object>> = new Map<string, ServiceConfig<Object, Object>>();

    /**
     * 维护fury接口描述 key -> 方法参数id value -> 接口描述对象
     */
    public static readonly DESCRIPTION_LIST: Map<string, DescriptionType> = new Map<string, DescriptionType>();

    /**
     * 维护fury序列化方法 key -> 方法参数id或者方法返回值id value -> 序列化方法
     */
    public static readonly DESCRIPTION_SERIALIZER_LIST: Map<string, Function> = new Map<string, Function>();

    /**
     * 维护已经配置好的代理对象 key -> 服务名 value -> ReferenceConfig
     */
    public static readonly REFERENCES_LIST: Map<string, ReferenceConfig<Object, Object>> = new Map<string, ReferenceConfig<Object, Object>>();

    /**
     * 连接的缓存 服务节点的地址端口 -> channel
     */
    public static readonly CHANNEL_CACHE: Map<string, Socket> = new Map<string, Socket>();

    /**
     * 最短响应时间的连接缓存
     */
    public static readonly ANSWER_TIME_CHANNEL_CACHE: Map<bigint, Socket> = new Map<bigint, Socket>();
}
