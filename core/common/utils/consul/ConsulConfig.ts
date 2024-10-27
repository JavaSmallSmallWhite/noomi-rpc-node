import { ConsulOptions, RegisterOptions } from "../TypesUtil";

/**
 * consul注册中心连接配置
 */
export interface ConsulRegistryConnectConfig extends ConsulOptions {}

/**
 * consul注册中心的服务配置
 */
export interface ServiceOptions extends RegisterOptions {}
