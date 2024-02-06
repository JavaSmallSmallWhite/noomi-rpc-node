import {RegistryConfig} from "../discovery/RegistryConfig";
import {JsonResolver} from "./JsonResolver";
import {RoundRobinLoadBalancer} from "../loadbalance/impl/RoundRobinLoadBalancer";
import {IdGeneratorUtil} from "../common/utils/IdGeneratorUtil";
import {Logger} from "../common/logger/Logger";
import {InterfaceUtil} from "../common/utils/InterfaceUtil";
import {RateLimiter} from "../sentinel/ratelimit/RateLimiter";
import {CircuitBreaker} from "../sentinel/circuitbreak/CircuitBreaker";
import {Configuration as Config} from "log4js";

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
     * 配置信息 --> 日志
     * @private
     */
    private _log4jsConfiguration: {configuration: Config, use: string} = {
        configuration: {
            appenders: {
                stdout: {
                    type: "stdout", layout: {
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
     * 配置信息 --> 服务前缀，服务的唯一标识，不可重复
     * @private
     */
    private _servicePrefix: string = "com.node.Test";

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
     * 配置信息 --> id发号器
     * @private
     */
    private _idGenerator: IdGeneratorUtil = new IdGeneratorUtil(1n, 2n);

    /**
     * todo 配置信息 --> 限流器，ip级别的限流，能很好限流，但是效率可能较低，服务级别的限流暂时未做
     * @private
     */
    private _everyIpRateLimiter: Map<string, RateLimiter> = new Map<string, RateLimiter>();

    /**
     * todo 配置信息 --> 熔断器，ip级别的熔断，做的比较简单，未包含半打开状态half-open
     * @private
     */
    private _everyIpCircuitBreaker: Map<string, CircuitBreaker> = new Map<string, CircuitBreaker>();

    /**
     * 加载配置文件，设定配置
     */
    public constructor() {
        const jsonResolver: JsonResolver = new JsonResolver();
        jsonResolver.loadFromJson(this);
    }

    /**
     * ------------------以下时上述配置信息的getter和setter方法-------------------------------------------------
     */
    get port(): number {
        return this._port;
    }

    set port(value: number) {
        Logger.info(`端口修改成功，端口为：${value}。`);
        this._port = value;
    }

    get appName(): string {
        return this._appName;
    }

    set appName(value: string) {
        Logger.info(`应用名称修改成功，应用名称为：${value}。`);
        this._appName = value;
    }

    get log4jsConfiguration(): {configuration: Config, use: string} {
        return this._log4jsConfiguration;
    }

    set log4jsConfiguration(value: {configuration: Config, use: string}) {
        this._log4jsConfiguration = value;
    }

    get servicePrefix(): string {
        return this._servicePrefix;
    }

    set servicePrefix(value: string) {
        Logger.info(`服务前缀修改成功，服务前缀为：${value}。`);
        this._servicePrefix = value;
    }

    get starterPath(): string | string[] {
        return this._starterPath;
    }

    set starterPath(value: string | string[]) {
        this._starterPath = value;
    }

    get registryConfig(): RegistryConfig {
        return this._registryConfig;
    }

    set registryConfig(value: RegistryConfig) {
        Logger.info(`注册中心修改成功，注册中心为：${value.registryName}。`);
        this._registryConfig = value;
    }

    get loadBalancerType(): string {
        return this._loadBalancerType;
    }

    set loadBalancerType(value: string) {
        Logger.info(`负载均衡策略修改成功，负载均衡策略为：${value}。`);
        this._loadBalancerType = value;
    }

    get serializerType(): string {
        return this._serializerType;
    }

    set serializerType(value: string) {
        Logger.info(`序列化器修改成功，序列化策略为：${value}。`);
        this._serializerType = value;
    }

    get compressorType(): string {
        return this._compressorType;
    }

    set compressorType(value: string) {
        Logger.info(`压缩器修改成功，压缩策略为：${value}。`);
        this._compressorType = value;
    }

    get idGenerator(): IdGeneratorUtil {
        return this._idGenerator;
    }

    set idGenerator(value: IdGeneratorUtil) {
        Logger.info(`id发号器修改成功，id发号器为${InterfaceUtil.getInterfaceName(value)}。`);
        this._idGenerator = value;
    }


    get everyIpRateLimiter(): Map<string, RateLimiter> {
        return this._everyIpRateLimiter;
    }


    get everyIpCircuitBreaker(): Map<string, CircuitBreaker> {
        return this._everyIpCircuitBreaker;
    }
}
