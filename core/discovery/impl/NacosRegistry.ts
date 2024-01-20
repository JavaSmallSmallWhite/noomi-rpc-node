import {AbstractRegistry} from "../AbstractRegistry";
import {DescriptionType, ServiceConfig} from "../../ServiceConfig";
import {NoomiRpcStarter} from "../../NoomiRpcStarter";
import {NetUtil} from "../../common/utils/NetUtil";
import {Host, NacosNamingClient} from "nacos";
import {NacosUtils} from "../../common/utils/nacos/NacosUtils";
import {NacosRegistryConnectConfig, NacosServiceInstance} from "../../common/utils/nacos/NacosConfig";
import {IdGeneratorUtil} from "../../common/utils/IdGeneratorUtil";
import {InterfaceUtil} from "../../common/utils/InterfaceUtil";
import {GlobalCache} from "../../cache/GlobalCache";
import {Starter} from "../../index";

/**
 * nacos注册中心的服务注册与发现类
 */
export class NacosRegistry extends AbstractRegistry {

    /**
     * 维护一个nacos注册中心
     * @private
     */
    private readonly nacos: NacosNamingClient;

    /**
     * 构造器
     * @param nacosRegistryConnectConfig nacos注册中心连接配置
     */
    public constructor(nacosRegistryConnectConfig?: NacosRegistryConnectConfig) {
        super();
        this.nacos = NacosUtils.createNacosRegistryCenter(nacosRegistryConnectConfig);
    }

    /**
     * 服务注册
     * @param service 服务配置
     */
    public async register(service: ServiceConfig<Object, Object>): Promise<void> {
        const servicePrefix: string = Starter.getInstance().getConfiguration().servicePrefix;
        const interfaceName: string = service.interfaceProvider.constructor.name;
        const serviceName: string = servicePrefix + "." + interfaceName;
        const ip: string = NetUtil.getIpv4Address();
        const port: number = Starter.getInstance().getConfiguration().port;
        const idGenerator: IdGeneratorUtil = Starter.getInstance().getConfiguration().idGenerator;
        let interfaceDescription: Array<DescriptionType> = [];
        InterfaceUtil.getInterfaceMethodsName(service.interfaceDescription, true).forEach(methodName => {
            const methodId1: string = String(idGenerator.getId());
            const methodId2: string = String(idGenerator.getId());
            const methodDescription: DescriptionType = {
                methodId1: methodId1,
                methodId2: methodId2,
                methodName: methodName,
                serviceName: serviceName
            }
            GlobalCache.DESCRIPTION_LIST.set(methodDescription.methodId1, methodDescription);
            interfaceDescription.push(methodDescription)
        });
        const nacosServiceInstance: NacosServiceInstance = {ip: ip, port: port, metadata: {description: JSON.stringify(interfaceDescription)}};
        await NacosUtils.registerInstance(this.nacos, serviceName, nacosServiceInstance);
    }

    /**
     * 服务发现
     * @param serviceName 服务名
     */
    public async lookup(serviceName: string): Promise<Array<string>> {
        const serviceInstances: Host[] = await NacosUtils.getAllInstances(this.nacos, serviceName);
        const serviceNodeNames: Array<string> = [];
        for (const serviceInstance of serviceInstances) {
            const ip: string = serviceInstance.ip;
            const port: number = serviceInstance.port;
            const metadata: Array<DescriptionType> = JSON.parse(serviceInstance.metadata["description"]);
            for (const item of metadata) {
                GlobalCache.DESCRIPTION_LIST.set(item.methodId1, item);
            }
            serviceNodeNames.push(ip + ":" + port);
        }
        return serviceNodeNames;
    }
}
