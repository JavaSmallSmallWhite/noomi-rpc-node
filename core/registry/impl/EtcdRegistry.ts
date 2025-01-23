import { AbstractRegistry } from "../AbstractRegistry";
import { ServiceConfig } from "../../ServiceConfig";

/**
 * todo 完成etcd注册中心
 * etcd注册中心的服务注册与发现类
 */
class EtcdRegistry extends AbstractRegistry {
  public lookup(serviceName: string): Promise<Array<string>> {
    return Promise.resolve(undefined);
  }

  public register(serviceConfig: ServiceConfig<NonNullable<unknown>>): void {}
}
