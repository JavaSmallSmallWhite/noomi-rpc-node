import {RegistryConfig} from "../discovery/RegistryConfig";
import {JsonResolver} from "./JsonResolver";
import {RoundRobinLoadBalancer} from "../loadbalance/impl/RoundRobinLoadBalancer";
import {IdGeneratorUtil} from "../common/utils/IdGeneratorUtil";
import {Logger} from "../common/logger/Logger";
import {InterfaceUtil} from "../common/utils/InterfaceUtil";

/**
 * 配置管理类
 */
export class Configuration {

    /**
     * 服务端启动端口号
     * @private
     */
    private _port: number = 8808;

    /**
     * 应用名称
     * @private
     */
    private _appName: string = "default";

    /**
     * 服务前缀，服务的唯一标识，不可重复
     * @private
     */
    private _servicePrefix: string = "com.node.Test";

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

    get servicePrefix(): string {
        return this._servicePrefix;
    }

    set servicePrefix(value: string) {
        Logger.info(`服务前缀修改成功，服务前缀为：${value}。`);
        this._servicePrefix = value;
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
}
