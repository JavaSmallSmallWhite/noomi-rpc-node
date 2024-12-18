import { Logger } from "../logger/Logger";
import { Application } from "./ApplicationUtil";
import { NoomiRpcError } from "../error/NoomiRpcError";
import { TipManager } from "../error/TipManager";

/**
 * 地址端口数组类型
 */
export type AddressPort = [string, number];

/**
 * 网络工具类
 */
export class NetUtil {
  /**
   * 获取本地ipv4地址
   */
  public static getIpv4Address(): string {
    const interfaces = Application.os.networkInterfaces();
    for (const devName in interfaces) {
      const iface = interfaces[devName];
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i];
        if (alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal) {
          return alias.address;
        }
      }
    }
    throw new NoomiRpcError("0400");
  }

  /**
   * 解析服务节点地址
   * @param serviceNodeAddress 服务节点地址
   */
  public static parseAddress(serviceNodeAddress: string): AddressPort {
    const address: string = serviceNodeAddress.split(":")[0];
    if (!address) {
      throw new NoomiRpcError("服务节点的地址异常，无法解析其ipv4地址。");
    }
    const port: string = serviceNodeAddress.split(":")[1];
    if (!port) {
      throw new NoomiRpcError("服务节点的地址异常，无法解析其端口。");
    }
    return [address, +port];
  }
}
