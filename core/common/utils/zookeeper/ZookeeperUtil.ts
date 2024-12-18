import { Constant } from "../Constant";
import { ZookeeperNode } from "./ZookeeperNode";
import { Logger } from "../../logger/Logger";
import { ZookeeperConnectConfig } from "./ZookeeperConfig";
import { Exception, Option, Stat, Zookeeper, Event } from "../TypesUtil";
import { Application } from "../ApplicationUtil";
import { NoomiRpcError } from "../../error/NoomiRpcError";
import { TipManager } from "../../error/TipManager";

/**
 * zookeeper工具类
 */
export class ZookeeperUtil {
  /**
   * 创建zookeeper实例
   * @param zookeeperConnectConfig zookeeper连接配置
   * @return zookeeper实例
   */
  public static createZookeeper(zookeeperConnectConfig?: ZookeeperConnectConfig): Zookeeper {
    // 没有连接配置则使用默认的
    if (!zookeeperConnectConfig) {
      Logger.info(TipManager.getTip("0114", "zookeeper"));
      // 定义连接数
      const connectString: string = Constant.DEFAULT_ZK_CONNECT_STRING;
      const connectConfig: ZookeeperConnectConfig = {
        connectString: connectString
      };
      // 创建zookeeper
      return this.createZookeeper(connectConfig);
    } else {
      if (!zookeeperConnectConfig.connectString) {
        throw new NoomiRpcError("0200", "zookeeper");
      }
      try {
        const connectString: string = zookeeperConnectConfig.connectString;
        const options: Partial<Option> = zookeeperConnectConfig.options;
        const client: Zookeeper = Application.zookeeper.createClient(connectString, options);
        client.connect();
        Logger.debug(TipManager.getTip("0115", "zookeeper"));
        return client;
      } catch (error) {
        throw new NoomiRpcError("0201", "zookeeper", error.message);
      }
    }
  }

  /**
   * 创建一个节点的工具方法
   * @param zookeeper zookeeper实例
   * @param node 节点
   * @param watcher 是否监控
   * @param createMode 节点的类型
   * @return true: 成功创建 false：已经存在 异常：抛出
   */
  public static async createNode(
    zookeeper: Zookeeper,
    node: ZookeeperNode,
    watcher: (event: Event) => void,
    createMode: number
  ): Promise<boolean> {
    const isExist: boolean = await this.exist(zookeeper, node.nodePath, watcher);
    if (!isExist) {
      const result: Error | Exception | string = await new Promise((resolve, reject): void => {
        zookeeper.create(
          node.nodePath,
          node.data,
          createMode,
          function (error: Error | Exception, path: string): void {
            if (error) {
              reject(error);
            }
            resolve(path);
          }
        );
      });
      if (result instanceof Error || result instanceof Application.zookeeper.Exception) {
        throw new NoomiRpcError(
          "0206",
          node.nodePath,
          ("message" in result && result.message) || result.toString()
        );
      }
      Logger.info(TipManager.getTip("0119", result));
      return true;
    } else {
      Logger.info(TipManager.getTip("0120", node.nodePath));
      return false;
    }
  }

  /**
   * 判断节点是否存在
   * @param zookeeper zookeeper实例
   * @param nodePath 节点路径
   * @param watcher watcher
   * @return true 存在 | false 不存在
   */
  public static async exist(
    zookeeper: Zookeeper,
    nodePath: string,
    watcher: (event: Event) => void
  ): Promise<boolean> {
    const result: boolean | Error | Exception = await new Promise((resolve, reject): void => {
      zookeeper.exists(nodePath, watcher, function (error: Error | Exception, stat: Stat): void {
        if (error) {
          reject(error);
        }
        if (stat) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });

    if (result instanceof Error || result instanceof Application.zookeeper.Exception) {
      throw new NoomiRpcError(
        "0206",
        nodePath,
        ("message" in result && result.message) || result.toString()
      );
    }
    return result;
  }

  /**
   * 获取节点的子节点
   * @param zookeeper zookeeper实例
   * @param serviceNode 服务节点
   * @param watcher 是否监控
   */
  public static async getChildren(
    zookeeper: Zookeeper,
    serviceNode: string,
    watcher: (event: Event) => void
  ): Promise<string[]> {
    const result: string[] | Error | Exception = await new Promise((resolve, reject): void => {
      zookeeper.getChildren(
        serviceNode,
        watcher,
        function (error: Error | Exception, children: string[]): void {
          if (error) {
            reject(error);
          }
          resolve(children);
        }
      );
    });

    if (result instanceof Error || result instanceof Application.zookeeper.Exception) {
      throw new NoomiRpcError(
        "0207",
        serviceNode,
        ("message" in result && result.message) || result.toString()
      );
    }
    Logger.debug(TipManager.getTip("0121", serviceNode, result.toString));
    return result;
  }

  /**
   * 获取节点的数据
   * @param zookeeper zookeeper实例
   * @param nodePath 节点路径
   */
  public static async getNodeData(zookeeper: Zookeeper, nodePath: string): Promise<Buffer> {
    const result: Buffer | Error | Exception = await new Promise((resolve, reject): void => {
      zookeeper.getData(nodePath, function (error: Error | Exception, data: Buffer): void {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });

    if (result instanceof Error || result instanceof Application.zookeeper.Exception) {
      throw new NoomiRpcError(
        "0208",
        nodePath,
        ("message" in result && result.message) || result.toString()
      );
    }
    Logger.debug(TipManager.getTip("0122", nodePath, result));
    return result;
  }

  /**
   * 关闭zookeeper的方法
   * @param zookeeper
   */
  public static close(zookeeper: Zookeeper): void {
    try {
      zookeeper.close();
      Logger.debug(TipManager.getTip("0123"));
    } catch (error) {
      throw new NoomiRpcError("0209", error.message);
    }
  }
}
