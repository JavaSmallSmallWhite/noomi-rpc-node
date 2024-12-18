import { ConsulRegistryConnectConfig, ServiceOptions } from "./ConsulConfig";
import { Logger } from "../../logger/Logger";
import { Constant } from "../Constant";
import { NoomiRpcStarter } from "../../../NoomiRpcStarter";
import { ConsulConnection } from "../TypesUtil";
import { Application } from "../ApplicationUtil";
import { NoomiRpcError } from "../../error/NoomiRpcError";

/**
 * consul工具类
 */
export class ConsulUtil {
  /**
   * 创建consul实例
   * @param consulConfig consul连接配置
   */
  public static createConsul(consulConfig?: ConsulRegistryConnectConfig): ConsulConnection {
    if (!consulConfig) {
      Logger.info("用户未设定consul注册中心的连接配置，将使用默认的连接配置。");
      return Reflect.construct(Application.consul, [
        {
          host: Constant.HOST,
          port: Constant.PORT,
          promisify: Constant.PROMISIFY
        }
      ]);
    }
    const consul: ConsulConnection = Reflect.construct(Application.consul, [consulConfig]);
    Logger.debug("客户端已经连接consul注册中心成功。");
    return consul;
  }

  /**
   * 注册服务
   * @param consul consul注册中心
   * @param serviceOptions consul服务配置
   */
  public static async register(
    consul: ConsulConnection,
    serviceOptions: ServiceOptions
  ): Promise<void> {
    try {
      serviceOptions["id"] = String(
        NoomiRpcStarter.getInstance().getConfiguration().idGenerator.getId()
      );
      await consul.agent.service.register(serviceOptions);
      Logger.debug(
        `${serviceOptions.name}服务的${serviceOptions.address}:${serviceOptions.port}节点注册成功。`
      );
    } catch (error) {
      Logger.error(
        `${serviceOptions.name}服务的${serviceOptions.address}:${serviceOptions.port}节点注册失败。`
      );
      throw new NoomiRpcError(error.message);
    }
  }

  /**
   * 获取服务的所有实例
   * @param consul consul注册中心
   * @param serviceName 服务名称
   */
  public static async list(consul: ConsulConnection, serviceName: string): Promise<unknown> {
    try {
      const res = <Array<unknown>>await consul.health.service(serviceName);
      const newRes = res.map((item) => item["Service"]);
      Logger.debug(`获取${serviceName}下的所有服务节点实例成功。`);
      return newRes;
    } catch (error) {
      Logger.error(`获取${serviceName}服务的节点实例失败。`);
      throw new NoomiRpcError(error.message);
    }
  }
}
