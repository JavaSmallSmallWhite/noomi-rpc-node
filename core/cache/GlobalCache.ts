import { NoomiRpcRequest } from "../message/NoomiRpcRequest";
import { ServiceConfig } from "../ServiceConfig";
import { ReferenceConfig } from "../ReferenceConfig";
import { Registry } from "../registry/Registry";
import { AsyncLocalStorage, Socket } from "../common/utils/TypesUtil";
import { Application } from "../common/utils/ApplicationUtil";

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
  public static readonly localStorage: AsyncLocalStorage<NoomiRpcRequest> =
    new Application.asyncHooks.AsyncLocalStorage<NoomiRpcRequest>();

  /**
   * 维护已经发布且暴露的服务列表 key -> 服务名 value -> ServiceConfig
   */
  public static readonly SERVICES_LIST: Map<string, ServiceConfig<NonNullable<unknown>>> = new Map<
    string,
    ServiceConfig<NonNullable<unknown>>
  >();

  /**
   * 维护已经配置好的代理对象 key -> 服务名 value -> ReferenceConfig
   */
  public static readonly REFERENCES_LIST: Map<string, ReferenceConfig<NonNullable<unknown>>> =
    new Map<string, ReferenceConfig<NonNullable<unknown>>>();

  /**
   * 连接的缓存 服务节点的地址端口 -> channel
   */
  public static readonly CHANNEL_CACHE: Map<string, Socket> = new Map<string, Socket>();

  /**
   * 最短响应时间的连接缓存
   */
  public static readonly ANSWER_TIME_CHANNEL_CACHE: Map<bigint, Socket> = new Map<bigint, Socket>();

  /**
   * protobuf的ROOT缓存器 文件地址 -> protobuf.Service
   */
  public static readonly PROTOBUF_ROOT_CACHE: Map<string, protobuf.Root> = new Map<
    string,
    protobuf.Root
  >();
}
