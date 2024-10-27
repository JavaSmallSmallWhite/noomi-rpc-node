import { ServiceConfig } from "../ServiceConfig";

export interface Registry {
  /**
   * 注册服务
   * @param serviceConfig 服务的配置内容
   */
  register(serviceConfig: ServiceConfig<NonNullable<unknown>>): void;

  /**
   * 从注册中心拉取服务列表
   * @param serviceName 服务的名称
   * @return 服务的地址
   */
  lookup(serviceName: string): Promise<Array<string>>;
}
