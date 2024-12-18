import { RegistryConfig } from "../registry/RegistryConfig";
import { IdGenerator } from "../common/utils/IdGenerator";
import { Logger } from "../common/logger/Logger";
import { InterfaceUtil } from "../common/utils/InterfaceUtil";
import { RateLimiter } from "../sentinel/ratelimit/RateLimiter";
import { CircuitBreaker } from "../sentinel/circuitbreak/CircuitBreaker";
import { Configuration as Config } from "log4js";
import { GlobalCache } from "../cache/GlobalCache";
import { ObjectWrapper } from "./ObjectWrapper";
import { LoadBalancer } from "../loadbalance/LoadBalancer";
import { LoadBalancerFactory } from "../loadbalance/LoadBalancerFactory";
import { SerializerFactory } from "../serialize/SerializerFactory";
import { CompressorFactory } from "../compress/CompressorFactory";
import { Compressor } from "../compress/Compressor";
import { Serializer } from "../serialize/Serializer";
import { Application } from "../common/utils/ApplicationUtil";
import { DBManager } from "noomi";
import { NoomiRpcError } from "../common/error/NoomiRpcError";
import { TipManager } from "../common/error/TipManager";

/**
 * 配置管理类
 */
export class Configuration {
  /**
   * 配置信息 --> 服务端启动端口号
   * @private
   */
  private _port: number = 8808;

  /**
   * 配置信息 --> 应用名称
   * @private
   */
  private _appName: string = "default";

  /**
   * 配置信息 --> 语言
   * @private
   */
  private _language: string = "zh";

  /**
   * 配置信息 --> 日志
   * @private
   */
  private _log4jsConfiguration: { configuration: Config; use: string } = {
    configuration: {
      appenders: {
        stdout: {
          type: "stdout",
          layout: {
            type: "pattern",
            pattern: "%d [%p] [%c] - %m%n"
          }
        }
      },
      categories: {
        default: {
          appenders: ["stdout"],
          level: "debug"
        }
      }
    },
    use: "stdout"
  };

  /**
   * 配置信息 --> 接口目录
   * @private
   */
  private _apiDir: string | string[] = ["/dist/examples/consumer/api"];

  /**
   * 配置信息 --> 项目启动目录
   * @private
   */
  private _starterPath: string | string[] = ["/dist/examples/**/*.js"];

  /**
   * 配置信息 --> 注册中心
   * @private
   */
  private _registryConfig: RegistryConfig = new RegistryConfig("zookeeper");

  /**
   * 配置信息 --> 负载均衡器
   * @private
   */
  private _loadBalancerType: string = "RoundRobinLoadBalancer";

  /**
   * 配置信息 --> 序列化器
   * @private
   */
  private _serializerType: string = "json";

  /**
   * 配置信息 --> 压缩器
   * @private
   */
  private _compressorType: string = "gzip";

  /**
   * 熔断器类型
   * @private
   */
  private _circuitBreakerType: string = "SeniorCircuitBreaker";

  /**
   * 限流器类型
   * @private
   */
  private _rateLimiterType: string = "TokenBuketRateLimiter";

  /**
   * 配置信息 --> id发号器
   * @private
   */
  private _idGenerator: IdGenerator = new IdGenerator(1n, 2n);

  /**
   * todo 配置信息 --> 限流器，ip级别的限流，能很好限流，但是效率可能较低，服务级别的限流暂时未做
   * @private
   */
  private _everyIpRateLimiter: Map<string, RateLimiter> = new Map<string, RateLimiter>();

  /**
   * @private
   */
  private _everyIpCircuitBreaker: Map<string, CircuitBreaker> = new Map<string, CircuitBreaker>();

  /**
   * 加载配置文件，设定配置
   */
  public constructor() {
    new JsonResolver().loadFromJson(this);
  }

  /**
   * ------------------以下时上述配置信息的getter和setter方法-------------------------------------------------
   */
  get port(): number {
    return this._port;
  }

  set port(value: number) {
    this._port = value;
    Logger.info(TipManager.getTip("0100", value));
  }

  get language(): string {
    return this._language;
  }

  set language(value: string) {
    this._language = value;
    Logger.info(TipManager.getTip("0101", value));
  }

  get appName(): string {
    return this._appName;
  }

  set appName(value: string) {
    this._appName = value;
    Logger.info(TipManager.getTip("0102", value));
  }

  get log4jsConfiguration(): { configuration: Config; use: string } {
    return this._log4jsConfiguration;
  }

  set log4jsConfiguration(value: { configuration: Config; use: string }) {
    this._log4jsConfiguration = value;
    // Logger.info(TipManager.getTip("0103", value.use));
  }

  get apiDir(): string | string[] {
    return this._apiDir;
  }

  set apiDir(value: string | string[]) {
    this._apiDir = value;
    Logger.info(TipManager.getTip("0104", value));
  }

  get starterPath(): string | string[] {
    return this._starterPath;
  }

  set starterPath(value: string | string[]) {
    this._starterPath = value;
    Logger.info(TipManager.getTip("0105", value));
  }

  get registryConfig(): RegistryConfig {
    return this._registryConfig;
  }

  set registryConfig(value: RegistryConfig) {
    this._registryConfig = value;
    Logger.info(TipManager.getTip("0106", value.registryName));
  }

  get loadBalancerType(): string {
    return this._loadBalancerType;
  }

  set loadBalancerType(value: string) {
    this._loadBalancerType = value;
    Logger.info(TipManager.getTip("0107", value));
  }

  get serializerType(): string {
    return this._serializerType;
  }

  set serializerType(value: string) {
    this._serializerType = value;
    Logger.info(TipManager.getTip("0108", value));
  }

  get compressorType(): string {
    return this._compressorType;
  }

  set compressorType(value: string) {
    this._compressorType = value;
    Logger.info(TipManager.getTip("0109", value));
  }

  get idGenerator(): IdGenerator {
    return this._idGenerator;
  }

  set idGenerator(value: IdGenerator) {
    this._idGenerator = value;
    Logger.info(TipManager.getTip("0110", InterfaceUtil.getInterfaceName(value)));
  }

  get circuitBreakerType(): string {
    return this._circuitBreakerType;
  }

  set circuitBreakerType(value: string) {
    this._circuitBreakerType = value;
    Logger.info(TipManager.getTip("0111", value));
  }

  get rateLimiterType(): string {
    return this._rateLimiterType;
  }

  set rateLimiterType(value: string) {
    this._rateLimiterType = value;
    Logger.info(TipManager.getTip("0112", value));
  }

  get everyIpRateLimiter(): Map<string, RateLimiter> {
    return this._everyIpRateLimiter;
  }

  get everyIpCircuitBreaker(): Map<string, CircuitBreaker> {
    return this._everyIpCircuitBreaker;
  }
}

/**
 * Json解析器
 */
class JsonResolver {
  /**
   * 从json文件解析配置
   */
  public loadFromJson(configuration: Configuration): void {
    const jsonStr: string = Application.fs.readFileSync(
      Application.path.resolve("config", "rpc.json"),
      "utf-8"
    );
    if (jsonStr === null) {
      throw new NoomiRpcError(TipManager.getError("0100"));
    }
    let configObject: object = null;
    try {
      configObject = Application.json5.parse(jsonStr);
    } catch (error) {
      throw new NoomiRpcError(TipManager.getError("0101"));
    }
    try {
      // 配置debug等级
      configuration.log4jsConfiguration = configObject["log4js"];
      Logger.configLog4js(
        configuration.log4jsConfiguration.configuration,
        configuration.log4jsConfiguration.use
      );
      // 配置端口
      configuration.port = configObject["port"];
      // 配置应用名称
      configuration.appName = configObject["appName"];
      // 配置语言
      configuration.language = configObject["language"];
      // 配置接口目录
      configuration.apiDir = configObject["apiDir"];
      // 配置项目启动目录
      configuration.starterPath = configObject["starterPath"];
      // 配置注册中心
      configuration.registryConfig = new RegistryConfig(
        configObject["registry"]["type"],
        configObject["registry"]["connectionConfig"]
      );
      GlobalCache.serviceConfiguration = configObject["registry"]["serviceConfig"];
      // 配置负载均衡
      const loadBalanceWrapper: ObjectWrapper<LoadBalancer> = LoadBalancerFactory.addLoadBalancer(
        configObject["loadBalancerType"]
      );
      configuration.loadBalancerType = loadBalanceWrapper.name;
      // 配置序列化器
      const serializerWrapper: ObjectWrapper<Serializer> = SerializerFactory.addSerializer(
        configObject["serializerType"]
      );
      configuration.serializerType = serializerWrapper.name;
      // 配置压缩器
      const compressorWrapper: ObjectWrapper<Compressor> = CompressorFactory.addCompressor(
        configObject["compressorType"]
      );
      configuration.compressorType = compressorWrapper.name;
      // 配置id法号器
      configuration.idGenerator = new IdGenerator(
        BigInt(configObject["idGenerator"]["dataCenterId"]),
        BigInt(configObject["idGenerator"]["machineId"])
      );
      // 配置熔断器类型
      configuration.circuitBreakerType = configObject["circuitBreaker"];
      // 配置限流器类型
      configuration.rateLimiterType = configObject["rateLimiter"];
      // 数据库配置
      if (configObject["database"]) {
        DBManager.parseFile(Application.path.resolve("config", configObject["database"]));
      }
      // 新增的标签，往下修改
      Logger.info(TipManager.getTip("0113"));
    } catch (error) {
      throw new NoomiRpcError(TipManager.getError("0102", error.message));
    }
  }
}
