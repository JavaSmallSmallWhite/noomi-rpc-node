import { Constant } from "../Constant";
import { ZookeeperError } from "../../error/ZookeeperError";
import { ZookeeperNode } from "./ZookeeperNode";
import { Logger } from "../../logger/Logger";
import { ZookeeperConnectConfig } from "./ZookeeperConfig";
import { Exception, Option, Stat, Zookeeper, Event } from "../TypesUtil";
import { Application } from "../ApplicationUtil";

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
      Logger.info("用户未设定zookeeper注册中心的连接配置，将使用默认的连接配置。");
      // 定义连接数
      const connectString: string = Constant.DEFAULT_ZK_CONNECT_STRING;
      const connectConfig: ZookeeperConnectConfig = {
        connectString: connectString
      };
      // 创建zookeeper
      return this.createZookeeper(connectConfig);
    } else {
      if (!zookeeperConnectConfig.connectString) {
        Logger.error("未设置zookeeper注册中心的连接地址。");
        throw new ZookeeperError("未设置zookeeper注册中心的连接地址。");
      }
      try {
        const connectString: string = zookeeperConnectConfig.connectString;
        const options: Partial<Option> = zookeeperConnectConfig.options;
        const client: Zookeeper = Application.zookeeper.createClient(connectString, options);
        client.connect();
        Logger.debug("客户端已经连接zookeeper注册中心成功。");
        return client;
      } catch (error) {
        Logger.error("创建zookeeper注册中心实例时发生异常：");
        throw new ZookeeperError(error.message);
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
      if (result instanceof Application.zookeeper.Exception) {
        Logger.error(`创建${node.nodePath}时发生异常，异常信息为：${result.toString()}`);
        throw new ZookeeperError(result.toString());
      }
      if (result instanceof Error) {
        Logger.error(`创建${node.nodePath}时发生异常，异常信息为：${result.message}`);
        throw new ZookeeperError(result.toString());
      }
      Logger.info(`根节点${result}，成功创建`);
      return true;
    } else {
      Logger.info(`节点${node.nodePath}已经存在，无需创建`);
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

    if (result instanceof Application.zookeeper.Exception) {
      Logger.error(`${nodePath}节点判断出现异常，异常信息为：${result.toString()}`);
      throw new ZookeeperError(result.toString());
    }
    if (result instanceof Error) {
      Logger.error(`${nodePath}节点判断出现异常，异常信息为：${result.message}`);
      throw new ZookeeperError(result.message);
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

    if (result instanceof Application.zookeeper.Exception) {
      Logger.error(`获取${serviceNode}节点的子节点发生异常，异常信息为：${result.toString()}`);
      throw new ZookeeperError(result.toString());
    }
    if (result instanceof Error) {
      Logger.error(`获取${serviceNode}节点的子节点发生异常，异常信息为：${result.message}`);
      throw new ZookeeperError(result.message);
    }
    Logger.debug(`获取${serviceNode}的所有子节点成功。子节点为${result}。`);
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

    if (result instanceof Application.zookeeper.Exception) {
      Logger.error(`获取${nodePath}节点数据发生异常，异常信息为：${result.toString()}`);
      throw new ZookeeperError(result.toString());
    }
    if (result instanceof Error) {
      Logger.error(`获取${nodePath}节点数据发生异常，异常信息为：${result.message}`);
      throw new ZookeeperError(result.message);
    }
    Logger.debug(`获取${nodePath}节点数据成功。节点数据为：${result}。`);
    return result;
  }

  /**
   * 关闭zookeeper的方法
   * @param zookeeper
   */
  public static close(zookeeper: Zookeeper): void {
    try {
      zookeeper.close();
    } catch (error) {
      Logger.error("关闭zookeeper时发生问题。");
      throw new ZookeeperError(error.message);
    }
  }
}
