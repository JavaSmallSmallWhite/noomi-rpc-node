import { RegistryConfig } from "./registry/RegistryConfig";
import { ServiceConfig } from "./ServiceConfig";
import { ReferenceConfig } from "./ReferenceConfig";
import { Configuration } from "./configuration/Configuration";
import { InterfaceUtil } from "./common/utils/InterfaceUtil";
import { Logger } from "./common/logger/Logger";
import { NetUtil } from "./common/utils/NetUtil";
import { HandlerFactory } from "./sockethandler/HandlerFactory";
import { IdGenerator } from "./common/utils/IdGenerator";
import { GlobalCache } from "./cache/GlobalCache";
import { GraceFullyShutdownHook } from "./shutdown/GraceFullyShutdownHook";
import { Application } from "./common/utils/ApplicationUtil";
import { Socket } from "./common/utils/TypesUtil";
import { HeartBeatDetector } from "./heartbeat/HeartBeatDetector";
import { NoomiRpcError } from "./common/error/NoomiRpcError";

/**
 * RPC框架启动类
 */
export class NoomiRpcStarter {
  /**
   * 初始化配置对象
   * @private
   */
  private configuration: Configuration;

  /**
   * 单例模式的懒汉式创建启动对象
   * @private
   */
  private static noomiRpcStarter: NoomiRpcStarter;

  /**
   * 启动器的构造器一被加载则加载所有的配置
   * @private
   */
  private constructor() {
    this.configuration = new Configuration();
    InterfaceUtil.loadDecorators(this.getConfiguration().starterPath);
  }

  /**
   * 获取启动器的实例
   */
  public static getInstance(): NoomiRpcStarter {
    if (this.noomiRpcStarter) {
      return this.noomiRpcStarter;
    }
    this.noomiRpcStarter = new NoomiRpcStarter();
    return this.noomiRpcStarter;
  }

  /**
   * 获取所有的配置
   */
  public getConfiguration(): Configuration {
    return this.configuration;
  }

  /**
   * 用来定义当前应用的名字
   * @param appName 应用的名字
   */
  public application(appName: string): NoomiRpcStarter {
    this.configuration.appName = appName;
    return this;
  }

  /**
   * 用来配置一个注册中心
   * @param registryConfig 注册中心
   */
  public registry(registryConfig: RegistryConfig): NoomiRpcStarter {
    this.configuration.registryConfig = registryConfig;
    return this;
  }

  /**
   * 配置负载均衡器
   * @param loadBalancerType 负载均衡器类型
   */
  public loadBalancer(loadBalancerType: string): NoomiRpcStarter {
    this.configuration.loadBalancerType = loadBalancerType;
    return this;
  }

  /**
   * 配置序列化器
   * @param serializerType 序列化器类型
   */
  public serializer(serializerType: string): NoomiRpcStarter {
    this.configuration.serializerType = serializerType;
    return this;
  }

  /**
   * 配置压缩器
   * @param compressorType 压缩器类型
   * @return this当前实例
   */
  public compressor(compressorType: string): NoomiRpcStarter {
    this.configuration.compressorType = compressorType;
    return this;
  }

  /**
   * 配置id发号器
   * @param dataCenterId 数据中心编号
   * @param machineId 机器号
   */
  public idGenerator(dataCenterId: bigint, machineId: bigint): NoomiRpcStarter {
    this.configuration.idGenerator = new IdGenerator(dataCenterId, machineId);
    return this;
  }

  /**
   * 配置熔断器
   * @param circuitBreakerType 熔断器类型
   */
  public circuitBreaker(circuitBreakerType: string): NoomiRpcStarter {
    this.configuration.circuitBreakerType = circuitBreakerType;
    return this;
  }

  /**
   * 配置限流器
   * @param rateLimiterType 限流器类型
   */
  public rateLimiter(rateLimiterType: string): NoomiRpcStarter {
    this.configuration.rateLimiterType = rateLimiterType;
    return this;
  }

  /**
   * ------------------------------------服务提供方的相关api------------------------------------------------------
   */

  /**
   * 发布服务，将接口 -> 实现，注册到服务中心
   * @param service   封装需要发布的服务
   */
  public async publish(service: ServiceConfig<NonNullable<unknown>>): Promise<void> {
    process.on("SIGINT", GraceFullyShutdownHook.run);
    process.on("SIGTERM", GraceFullyShutdownHook.run);
    const serviceName: string = service.serviceName;
    if (!serviceName) {
      throw new NoomiRpcError(`未配置服务名称。`);
    }
    if (GlobalCache.SERVICES_LIST.has(serviceName)) {
      throw new NoomiRpcError(`${serviceName}已存在。`);
    }
    this.configuration.registryConfig.getRegistry().register(service);
    GlobalCache.SERVICES_LIST.set(serviceName, service);
  }

  /**
   * 启动tcp服务
   */
  public start(): void {
    const port = NoomiRpcStarter.getInstance().getConfiguration().port;
    const address = NetUtil.getIpv4Address();
    const server = Application.net.createServer();
    server.on("close", function (): void {
      Logger.info("tcp服务器关闭。");
    });
    server.on("error", function (error: Error): void {
      Logger.error(`tcp服务器出现异常，异常信息为：${error.message}`);
    });
    server.on("connection", function (socketChannel: Socket): void {
      HandlerFactory.handleProviderRequestAndResponse(socketChannel).then();
    });
    server.listen(port, function (): void {
      Logger.info(`tcp服务器启动成功，监听服务器地址为：${address}，监听端口为：${port}`);
    });
  }

  /**
   * ------------------------------------服务调用方的相关api------------------------------------------------------
   */

  /**
   * 配置代理对象
   * @param reference 代理
   */
  public async reference(reference: ReferenceConfig<NonNullable<unknown>>): Promise<void> {
    const serviceName: string = reference.serviceName;
    GlobalCache.REFERENCES_LIST.set(serviceName, reference);
    HeartBeatDetector.detectHeartbeat(serviceName).then();
  }
}
