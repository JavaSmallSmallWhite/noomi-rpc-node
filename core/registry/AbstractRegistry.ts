import {Registry} from "./Registry";
import {ServiceConfig} from "../ServiceConfig";

export abstract class AbstractRegistry implements Registry {

    /**
     * 服务注册
     * @param serviceConfig 服务配置
     */
    public abstract register(serviceConfig: ServiceConfig<Object>): void;

    /**
     * 服务发现
     * @param serviceName 服务名称
     */
    public abstract lookup(serviceName: string): Promise<Array<string>>;
}
