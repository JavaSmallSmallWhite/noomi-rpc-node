import { Constant } from "../Constant";
import { Logger } from "../../logger/Logger";
import { NacosError } from "../../error/NacosError";
import { NacosRegistryConnectConfig, NacosServiceInstance } from "./NacosConfig";
import { NacosUpAndDownWatcher } from "../../../watch/NacosUpAndDownWatcher";
import {
  Host,
  Hosts,
  Instance,
  NacosNamingClient,
  NacosNamingClientConfig,
  SubscribeInfo
} from "../TypesUtil";
import { Application } from "../ApplicationUtil";

/**
 * nacos注册中心工具类
 */
export class NacosUtil {
  /**
   * 用于判断nacos客户端是否ready
   * @private
   */
  private static clientIsReady: boolean = false;

  /**
   * 创建nacos注册中心实例
   * @param nacosRegistryConnectConfig nacos注册中心连接配置
   */
  public static createNacosRegistryCenter(
    nacosRegistryConnectConfig?: NacosRegistryConnectConfig
  ): NacosNamingClient {
    if (!nacosRegistryConnectConfig) {
      Logger.info("用户未设置nacos注册中心的连接配置，将启用默认的连接配置。");
      const serviceList: string | string[] = Constant.SERVICE_LIST;
      const namespace: string = Constant.NAMESPACE;
      const logger: Console = console;
      const connectConfig: NacosRegistryConnectConfig = {
        logger: logger,
        serverList: serviceList,
        namespace: namespace
      };
      return this.createNacosRegistryCenter(connectConfig);
    } else {
      if (!nacosRegistryConnectConfig.serverList) {
        Logger.error("连接nacos注册中心的配置未配置连接地址。");
        throw new NacosError("连接nacos注册中心的配置未配置连接地址。");
      }
      nacosRegistryConnectConfig.logger ||= console;
      nacosRegistryConnectConfig.namespace ||= Constant.NAMESPACE;
      nacosRegistryConnectConfig.endpoint ||= Constant.ENDPOINT;
      nacosRegistryConnectConfig.vipSrvRefInterMillis ||= Constant.VIP_SRV_REF_INTER_MILLIS;
      nacosRegistryConnectConfig.ssl ||= Constant.SSL;
      try {
        const client: NacosNamingClient = new Application.nacos.NacosNamingClient(
          <NacosNamingClientConfig>nacosRegistryConnectConfig
        );
        Logger.debug("客户端已经连接nacos注册中心成功。");
        return client;
      } catch (error) {
        Logger.error("创建nacos注册中心实例时发生异常：");
        throw new NacosError(error.message);
      }
    }
  }

  /**
   * 注册服务实例
   * @param nacos nacos注册中心
   * @param serviceName 服务名称
   * @param nacosServiceInstance nacos服务节点实例配置
   * @param groupName 组名
   */
  public static async registerInstance(
    nacos: NacosNamingClient,
    serviceName: string,
    nacosServiceInstance: NacosServiceInstance,
    groupName: string = Constant.GROUP_NAME
  ): Promise<void> {
    try {
      if (!this.clientIsReady) {
        await nacos.ready();
        this.clientIsReady = true;
      }
      await nacos.registerInstance(serviceName, <Instance>nacosServiceInstance, groupName);
      Logger.debug(
        `${serviceName}服务的${nacosServiceInstance.ip}:${nacosServiceInstance.port}节点注册成功。`
      );
    } catch (error) {
      Logger.error(
        `${serviceName}服务的${nacosServiceInstance.ip}:${nacosServiceInstance.port}节点注册失败。`
      );
      throw new NacosError(error.message);
    }
  }

  /**
   * 获取服务的所有实例
   * @param nacos nacos注册中心
   * @param serviceName 服务名称
   * @param groupName 组名
   * @param clusters 集群名称
   * @param subscribe 是否监听
   */
  public static async getAllInstances(
    nacos: NacosNamingClient,
    serviceName: string,
    groupName?: string,
    clusters?: string,
    subscribe?: boolean
  ): Promise<Host[]> {
    try {
      if (!this.clientIsReady) {
        await nacos.ready();
      }
      const hosts: Host[] = await nacos.getAllInstances(
        serviceName,
        groupName,
        clusters,
        subscribe
      );
      Logger.debug(`获取${serviceName}下的所有服务节点实例成功。`);
      this.watch(nacos, serviceName);
      return hosts;
    } catch (error) {
      Logger.error(`获取${serviceName}服务的节点实例失败。`);
      throw new NacosError(error.message);
    }
  }

  /**
   * 监控服务
   * @param nacos nacos注册中心
   * @param serviceName 服务名称
   * @private
   */
  private static watch(nacos: NacosNamingClient, serviceName: string | SubscribeInfo): void {
    try {
      nacos.subscribe(serviceName, (hosts: Hosts): void => {
        NacosUpAndDownWatcher.process(serviceName, hosts);
      });
      Logger.debug(`服务${serviceName}监听成功。`);
    } catch (error) {
      Logger.error(`服务${serviceName}监听失败。`);
      throw new NacosError(error.message);
    }
  }
}
