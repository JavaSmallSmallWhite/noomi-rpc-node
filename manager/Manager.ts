import { Client as Zookeeper, CreateMode } from "node-zookeeper-client";
import { ZookeeperUtil } from "../core/common/utils/zookeeper/ZookeeperUtil";
import { Constant } from "../core/common/utils/Constant";
import { ZookeeperNode } from "../core/common/utils/zookeeper/ZookeeperNode";

// 创建zookeeper
const zookeeper: Zookeeper = ZookeeperUtil.createZookeeper();

// 创建节点路径
const providerPath: string = Constant.BASE_PROVIDERS_PATH;
const consumerPath: string = Constant.BASE_CONSUMERS_PATH;

// 创建节点
const providerNode: ZookeeperNode = new ZookeeperNode(providerPath, null);
const consumerNode: ZookeeperNode = new ZookeeperNode(consumerPath, null);

// 循环创建zookeeper节点
const nodes: Array<ZookeeperNode> = [providerNode, consumerNode];
nodes.forEach(async function (node: ZookeeperNode): Promise<void> {
  await ZookeeperUtil.createNode(zookeeper, node, null, CreateMode.PERSISTENT);
});

// 关闭zookeeper
ZookeeperUtil.close(zookeeper);
