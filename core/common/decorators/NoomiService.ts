import { ServiceConfig } from "../../ServiceConfig";
import { GlobalCache } from "../../cache/GlobalCache";
import { NoomiRpcStarter } from "../../NoomiRpcStarter";
import { Constructor } from "../utils/TypesUtil";

/**
 * 服务配置，具体参考npm nacos的相关选项
 */
interface ServiceConfiguration {
  healthy?: boolean;
  enabled?: boolean;
  weight?: number;
  ephemeral?: boolean;
  clusterName?: string;
  /**
   * 组名
   */
  groupName?: string;
}

/**
 * 服务选项
 */
interface ServiceOption {
  /**
   * 服务提供接口
   */
  interfaceProvider: Constructor;

  /**
   * 服务名称
   */
  serviceName: string;

  /**
   * 服务配置
   */
  serviceConfiguration?: ServiceConfiguration;
}

/**
 * 服务装饰器，装饰类
 * @constructor
 */
export function NoomiService<T extends NonNullable<unknown>>(
  serviceOption: ServiceOption
): (target: Constructor) => void {
  return async (target: Constructor): Promise<void> => {
    const service: ServiceConfig<T> = new ServiceConfig<T>();
    service.interfaceProvider = target;
    service.serviceName = serviceOption["serviceName"];
    if (serviceOption.serviceConfiguration) {
      GlobalCache.serviceConfiguration = serviceOption.serviceConfiguration;
    }
    await NoomiRpcStarter.getInstance().publish(service);
  };
}
