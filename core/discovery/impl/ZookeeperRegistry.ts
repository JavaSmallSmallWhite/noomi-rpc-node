import {AbstractRegistry} from "../AbstractRegistry";
import {DescriptionType, ServiceConfig} from "../../ServiceConfig";
import {ZookeeperUtils} from "../../common/utils/zookeeper/ZookeeperUtils";
import {Constant} from "../../common/utils/Constant";
import {ZookeeperNode} from "../../common/utils/zookeeper/ZookeeperNode";
import {NetUtil} from "../../common/utils/NetUtil";
import {Logger} from "../../common/logger/Logger";
import {ZookeeperConnectConfig} from "../../common/utils/zookeeper/ZookeeperConfig";
import {ZookeeperUpAndDownWatcher} from "../../watch/ZookeeperUpAndDownWatcher";
import {Client as Zookeeper, CreateMode} from "node-zookeeper-client";
import {IdGeneratorUtil} from "../../common/utils/IdGeneratorUtil";
import {InterfaceUtil} from "../../common/utils/InterfaceUtil";
import {GlobalCache} from "../../cache/GlobalCache";
import {Starter} from "../../index";

/**
 * zookeeper注册中心的服务注册与发现类
 */
export class ZookeeperRegistry extends AbstractRegistry {

    /**
     * 注册中心zookeeper
     * @private
     */
    private readonly zookeeper: Zookeeper;

    /**
     * 初始化注册中心，需要一个注册中心的连接配置
     * @param zookeeperConnectConfig 连接配置
     */
    public constructor(zookeeperConnectConfig?: ZookeeperConnectConfig) {
        super()
        this.zookeeper = ZookeeperUtils.createZookeeper(zookeeperConnectConfig);
    }

    /**
     * 服务注册
     * @param service 服务
     */
    public async register(service: ServiceConfig<Object, Object>): Promise<void> {
        const baseProviderPath: string = Constant.BASE_PROVIDERS_PATH;
        const servicePrefix: string = Starter.getInstance().getConfiguration().servicePrefix;
        const interfaceName: string = service.interfaceProvider.constructor.name;
        const serviceName: string = servicePrefix + "." + interfaceName;
        // 服务名称节点
        const parentNode: string = baseProviderPath + "/" + serviceName;
        // 不存在则创建持久节点
        if (!(await ZookeeperUtils.exist(this.zookeeper, parentNode, null))) {
            const zookeeperNode: ZookeeperNode = new ZookeeperNode(parentNode, null);
            await ZookeeperUtils.createNode(this.zookeeper, zookeeperNode, null, CreateMode.PERSISTENT);
        }
        const nodeAddress: string = NetUtil.getIpv4Address();
        const nodePort: number = Starter.getInstance().getConfiguration().port;
        // 创建服务节点
        const nodePath: string = parentNode + "/" + nodeAddress + ":" + nodePort;
        // 发布服务
        if (!await ZookeeperUtils.exist(this.zookeeper, nodePath, null)) {
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
            const zookeeperNode: ZookeeperNode = new ZookeeperNode(nodePath, Buffer.from(JSON.stringify(interfaceDescription)));
            await ZookeeperUtils.createNode(this.zookeeper, zookeeperNode, null, CreateMode.EPHEMERAL);
        }
        Logger.debug(`服务${parentNode}，已经被注册。`)
    }

    /**
     * 服务发现
     * @param serviceName 服务名
     */
    public async lookup(serviceName: string): Promise<Array<string>> {
        const serviceNode: string = Constant.BASE_PROVIDERS_PATH + "/" +serviceName;
        const children: string[] = await ZookeeperUtils.getChildren(this.zookeeper, serviceNode, ZookeeperUpAndDownWatcher.process);
        for (const child of children) {
            const nodeData: Buffer = await ZookeeperUtils.getNodeData(this.zookeeper, serviceNode + "/" + child);
            const nodeArray: Array<DescriptionType> = JSON.parse(nodeData.toString());
            nodeArray.forEach(item => {
                GlobalCache.DESCRIPTION_LIST.set(item.methodId1, item);
            })
        }
        return children;
    }
}
