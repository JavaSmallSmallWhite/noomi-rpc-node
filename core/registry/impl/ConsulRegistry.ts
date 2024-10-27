import { AbstractRegistry } from "../AbstractRegistry";
import { ServiceConfig } from "../../ServiceConfig";

/**
 * todo 完成consul注册中心
 * consul注册中心的服务注册与发现类
 */
class ConsulRegistry extends AbstractRegistry {
  public lookup(serviceName: string): Promise<Array<string>> {
    return Promise.resolve(undefined);
  }

  public register(serviceConfig: ServiceConfig<Object>): void {}
}
