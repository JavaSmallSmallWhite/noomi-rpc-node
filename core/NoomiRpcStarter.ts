import {RegistryConfig} from "./discovery/RegistryConfig";
import {ServiceConfig} from "./ServiceConfig";
import {ReferenceConfig} from "./ReferenceConfig";
import {Configuration} from "./config/Configuration";
import {InterfaceUtil} from "./common/utils/InterfaceUtil";
import {createServer, Server, Socket} from "net";
import {Logger} from "./common/logger/Logger";
import {NetUtil} from "./common/utils/NetUtil";
import {HandlerFactory} from "./channelhandler/HandlerFactory";
import {IdGeneratorUtil} from "./common/utils/IdGeneratorUtil";
import {HeartBeatDetector} from "./heartbeat/HeartBeatDetector";
import {GlobalCache} from "./cache/GlobalCache";
import {Starter} from "./index";

/**
 * RPC框架启动类
 */
export class NoomiRpcStarter {

    /**
     * 初始化配置对象
     * @private
     */
    private readonly configuration: Configuration;

    /**
     * 启动器的构造器一被加载则加载所有的配置
     * @private
     */
    private constructor() {
        // 构造启动引导程序时需要初始化配置
        this.configuration = new Configuration();
    }

    /**
     * 获取所有的配置
     */
    public getConfiguration(): Configuration {
        return this.configuration
    }

    /**
     * 用来定义当前应用的名字
     * @param appName 应用的名字
     * @return this当前实例
     */
    public application(appName: string): NoomiRpcStarter {
        this.configuration.appName = appName;
        return this;
    }

    /**
     * 设定服务的前缀
     * @param servicePrefix 服务前缀名
     */
    public servicePrefix(servicePrefix: string): NoomiRpcStarter {
        this.configuration.servicePrefix = servicePrefix;
        return this;
    }

    /**
     * 用来配置一个注册中心
     * @param registryConfig 注册中心
     * @return this当前实例
     */
    public registry(registryConfig: RegistryConfig): NoomiRpcStarter {
        this.configuration.registryConfig = registryConfig;
        return this;
    }

    /**
     * 配置负载均衡器
     * @param loadBalancerType 负载均衡器类型
     * @return this当前实例
     */
    public loadBalancer(loadBalancerType: string): NoomiRpcStarter {
        this.configuration.loadBalancerType = loadBalancerType;
        return this;
    }

    /**
     * 配置序列化器
     * @param serializerType 序列化器类型
     * @return this当前实例
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
        this.configuration.idGenerator = new IdGeneratorUtil(dataCenterId, machineId);
        return this;
    }

    /**
     * ------------------------------------服务提供方的相关api------------------------------------------------------
     */

    /**
     * 发布服务，将接口 -> 实现，注册到服务中心
     * @param service   封装需要发布的服务
     * @return          this当前实例
     */
    public async publish(service: ServiceConfig<Object, Object>): Promise<NoomiRpcStarter> {
        await this.configuration.registryConfig.getRegistry().register(service);
        const serviceName: string = InterfaceUtil.combine(this.configuration.servicePrefix, service.interfaceProvider.constructor.name);
        GlobalCache.SERVICES_LIST.set(serviceName, service);
        // 服务节点名称
        return this;
    }

    /**
     * 启动tcp服务
     */
    public start(): void {
        const port: number = Starter.getInstance().getConfiguration().port;
        const address: string = NetUtil.getIpv4Address();
        const server: Server = createServer();
        server.on("listening", function (): void {
            Logger.info("监听开始。")
        })
        server.on("close", function (): void {
            Logger.info("tcp服务器关闭。");
        })
        server.on("error", function (error: Error): void {
            Logger.error(`tcp服务器出现异常，异常信息为：${error.message}`);
        })
        server.on("connection", async function (socketChannel: Socket): Promise<void> {
            await HandlerFactory.handleProviderRequestAndResponse(socketChannel);
        })
        server.listen(port, function (): void {
            Logger.info(`tcp服务器启动成功，监听服务器地址为：${address}，监听端口为：${port}`);
        })
    }

    /**
     * ------------------------------------服务调用方的相关api------------------------------------------------------
     */

    /**
     * 配置代理对象
     * @param reference 代理
     */
    public async reference(reference: ReferenceConfig<Object, Object>): Promise<NoomiRpcStarter> {
        const interfaceName: string = InterfaceUtil.getInterfaceName(reference.interfaceRef);
        const serviceName: string = InterfaceUtil.combine(this.configuration.servicePrefix, interfaceName);
        GlobalCache.REFERENCES_LIST.set(serviceName, reference);
        await HeartBeatDetector.detectHeartbeat(serviceName);
        return this;
    }
}
