import { AbstractRegistry } from "../AbstractRegistry";
import { ServiceConfig } from "../../ServiceConfig";
import { NetUtil } from "../../common/utils/NetUtil";
import { Host, NacosNamingClient } from "nacos";
import { NacosUtil } from "../../common/utils/nacos/NacosUtil";
import {
  NacosRegistryConnectConfig,
  NacosServiceInstance
} from "../../common/utils/nacos/NacosConfig";
import { GlobalCache } from "../../cache/GlobalCache";
import { Constant } from "../../common/utils/Constant";
import { NoomiRpcStarter } from "../../NoomiRpcStarter";

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
    this.nacos = NacosUtil.createNacosRegistryCenter(nacosRegistryConnectConfig);
  }

  /**
   * 服务注册
   * @param service 服务配置
   */
  public async register(service: ServiceConfig<NonNullable<unknown>>): Promise<void> {
    const serviceName: string = service.serviceName;
    const ip: string = NetUtil.getIpv4Address();
    const port: number = NoomiRpcStarter.getInstance().getConfiguration().port;
    const nacosServiceInstance: NacosServiceInstance = {
      ip: ip,
      port: port,
      healthy: GlobalCache.serviceConfiguration["healthy"] || Constant.HEALTHY,
      enabled: GlobalCache.serviceConfiguration["enabled"] || Constant.ENABLED,
      weight: GlobalCache.serviceConfiguration["weight"] || Constant.WEIGHT,
      ephemeral: GlobalCache.serviceConfiguration["ephemeral"] || Constant.EPHEMERAL,
      clusterName: GlobalCache.serviceConfiguration["clusterName"] || Constant.CLUSTER_NAME
    };
    let groupName: string = GlobalCache.serviceConfiguration["groupName"];
    if (!groupName) {
      groupName = Constant.GROUP_NAME;
    }
    await NacosUtil.registerInstance(this.nacos, serviceName, nacosServiceInstance, groupName);
  }

  /**
   * 服务发现
   * @param serviceName 服务名
   */
  public async lookup(serviceName: string): Promise<Array<string>> {
    const serviceInstances: Host[] = await NacosUtil.getAllInstances(this.nacos, serviceName);
    const serviceNodeNames: Array<string> = [];
    for (const serviceInstance of serviceInstances) {
      const ip: string = serviceInstance.ip;
      const port: number = serviceInstance.port;
      serviceNodeNames.push(ip + ":" + port);
    }
    return serviceNodeNames;
  }
}
