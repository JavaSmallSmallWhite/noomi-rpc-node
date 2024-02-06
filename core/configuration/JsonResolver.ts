import * as fs from "fs";
import * as path from "path";
import * as json from "json5";
import {Logger} from "../common/logger/Logger";
import {ConfigError} from "../common/error/ConfigError";
import {Configuration} from "./Configuration";
import {RegistryConfig} from "../discovery/RegistryConfig";
import {LoadBalancerFactory} from "../loadbalance/LoadBalancerFactory";
import {ObjectWrapper} from "./ObjectWrapper";
import {LoadBalancer} from "../loadbalance/LoadBalancer";
import {Serializer} from "../serialize/Serializer";
import {SerializerFactory} from "../serialize/SerializerFactory";
import {Compressor} from "../compress/Compressor";
import {CompressorFactory} from "../compress/CompressorFactory";
import {IdGeneratorUtil} from "../common/utils/IdGeneratorUtil";
import {InterfaceUtil} from "../common/utils/InterfaceUtil";
import {GlobalCache} from "../cache/GlobalCache";

/**
 * Json解析器
 */
export class JsonResolver {

    /**
     * 从json文件解析配置
     */
    public loadFromJson(configuration: Configuration): void {
        const jsonStr: string = fs.readFileSync(path.resolve("config", "rpc.json"), "utf-8");
        if (jsonStr === null) {
            throw new ConfigError("读取rpc.json配置文件失败。");
        }
        let configObject: object = null;
        try {
            configObject = json.parse(jsonStr);
        } catch (error) {
            throw new ConfigError("解析rpc.json文件内容的配置对象失败。")
        }
        try {
            // 配置debug等级
            configuration.log4jsConfiguration = configObject["log4js"];
            Logger.configLog4js(configuration.log4jsConfiguration.configuration, configuration.log4jsConfiguration.use);
            Logger.info(`日志信息设置成功，使用的日志信息为：${configuration.log4jsConfiguration.use}。`);
            // 配置端口
            configuration.port = configObject["port"];
            Logger.info(`端口设置成功，端口为：${configuration.port}。`);
            // 配置应用名称
            configuration.appName = configObject["appName"];
            Logger.info(`应用名称设置成功，应用名称为：${configuration.appName}。`);
            // 配置服务前缀
            configuration.servicePrefix = configObject["servicePrefix"];
            Logger.info(`服务前缀设置成功，服务前缀为：${configuration.servicePrefix}。`);
            // 配置项目启动目录
            configuration.starterPath = configObject["starterPath"];
            Logger.info(`启动目录设置成功，服务前缀为：${configuration.starterPath}。`);
            // 配置注册中心
            configuration.registryConfig = new RegistryConfig(configObject["registry"]["type"], configObject["registry"]["connectionConfig"]);
            GlobalCache.serviceConfiguration = configObject["registry"]["serviceConfig"];
            Logger.info(`注册中心设置成功，注册中心为：${configuration.registryConfig.registryName}。`);
            // 配置负载均衡
            const loadBalanceWrapper: ObjectWrapper<LoadBalancer> = LoadBalancerFactory.getLoadBalancer(configObject["loadBalancerType"]);
            configuration.loadBalancerType = loadBalanceWrapper.name;
            Logger.info(`负载均衡策略设置成功，负载均衡策略为：${loadBalanceWrapper.name}。`);
            // 配置序列化器
            const serializerWrapper: ObjectWrapper<Serializer> = SerializerFactory.getSerializer(configObject["serializerType"]);
            configuration.serializerType = serializerWrapper.name;
            Logger.info(`序列化器设置成功，序列化策略为：${serializerWrapper.name}。`);
            // 配置压缩器
            const compressorWrapper: ObjectWrapper<Compressor> = CompressorFactory.getCompressor(configObject["compressorType"]);
            configuration.compressorType = compressorWrapper.name;
            Logger.info(`压缩器设置成功，压缩策略为：${compressorWrapper.name}。`);
            // 配置id法号器
            configuration.idGenerator = new IdGeneratorUtil(BigInt(configObject["idGenerator"]["dataCenterId"]), BigInt(configObject["idGenerator"]["machineId"]));
            Logger.info(`id发号器配置成功，id发号器为${InterfaceUtil.getInterfaceName(InterfaceUtil.getInterfaceName(configuration.idGenerator))}`);
            // 新增的标签，往下修改

            Logger.info("具体配置解析成功。")
        } catch (error) {
            Logger.error(`具体配置设置异常：${error.message}`);
            throw new ConfigError(error.message);
        }
    }
}
