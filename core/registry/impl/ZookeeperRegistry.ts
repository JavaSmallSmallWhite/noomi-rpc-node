import { AbstractRegistry } from "../AbstractRegistry";
import { ServiceConfig } from "../../ServiceConfig";
import { ZookeeperUtil } from "../../common/utils/zookeeper/ZookeeperUtil";
import { Constant } from "../../common/utils/Constant";
import { ZookeeperNode } from "../../common/utils/zookeeper/ZookeeperNode";
import { NetUtil } from "../../common/utils/NetUtil";
import { Logger } from "../../common/logger/Logger";
import { ZookeeperConnectConfig } from "../../common/utils/zookeeper/ZookeeperConfig";
import { ZookeeperUpAndDownWatcher } from "../../watch/ZookeeperUpAndDownWatcher";
import { NoomiRpcStarter } from "../../NoomiRpcStarter";
import { Zookeeper } from "../../common/utils/TypesUtil";
import { Application } from "../../common/utils/ApplicationUtil";

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
    super();
    this.zookeeper = ZookeeperUtil.createZookeeper(zookeeperConnectConfig);
  }

  /**
   * 服务注册
   * @param service 服务
   */
  public async register(service: ServiceConfig<NonNullable<unknown>>): Promise<void> {
    const baseProviderPath: string = Constant.BASE_PROVIDERS_PATH;
    const serviceName: string = service.serviceName;
    // 服务名称节点
    const parentNode: string = baseProviderPath + "/" + serviceName;
    // 不存在则创建持久节点
    if (!(await ZookeeperUtil.exist(this.zookeeper, parentNode, null))) {
      const zookeeperNode: ZookeeperNode = new ZookeeperNode(parentNode, null);
      await ZookeeperUtil.createNode(
        this.zookeeper,
        zookeeperNode,
        null,
        Application.zookeeper.CreateMode.PERSISTENT
      );
    }
    const nodeAddress: string = NetUtil.getIpv4Address();
    const nodePort: number = NoomiRpcStarter.getInstance().getConfiguration().port;
    // 创建服务节点
    const nodePath: string = parentNode + "/" + nodeAddress + ":" + nodePort;
    // 发布服务
    if (!(await ZookeeperUtil.exist(this.zookeeper, nodePath, null))) {
      const zookeeperNode: ZookeeperNode = new ZookeeperNode(
        nodePath,
        /*Buffer.from(JSON.stringify(interfaceDescription))*/ null
      );
      await ZookeeperUtil.createNode(
        this.zookeeper,
        zookeeperNode,
        null,
        Application.zookeeper.CreateMode.EPHEMERAL
      );
    }
    Logger.debug(`服务${parentNode}，已经被注册。`);
  }

  /**
   * 服务发现
   * @param serviceName 服务名
   */
  public async lookup(serviceName: string): Promise<Array<string>> {
    const serviceNode: string = Constant.BASE_PROVIDERS_PATH + "/" + serviceName;
    return await ZookeeperUtil.getChildren(
      this.zookeeper,
      serviceNode,
      ZookeeperUpAndDownWatcher.process
    );
  }
}
