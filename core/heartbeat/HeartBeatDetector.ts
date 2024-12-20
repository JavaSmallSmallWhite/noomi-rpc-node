import { NoomiRpcStarter } from "../NoomiRpcStarter";
import { Registry } from "../registry/Registry";
import { AddressPort, NetUtil } from "../common/utils/NetUtil";
import { NoomiRpcRequest } from "../message/NoomiRpcRequest";
import { RequestType } from "../code/RequestType";
import { SerializerFactory } from "../serialize/SerializerFactory";
import { CompressorFactory } from "../compress/CompressorFactory";
import { HandlerFactory } from "../sockethandler/HandlerFactory";
import { Logger } from "../common/logger/Logger";
import { GlobalCache } from "../cache/GlobalCache";
import { Constant } from "../common/utils/Constant";
import { Socket } from "../common/utils/TypesUtil";
import { Application } from "../common/utils/ApplicationUtil";
import { TipManager } from "../common/error/TipManager";

/**
 * 心跳检测
 */
export class HeartBeatDetector {
  /**
   * 定时任务
   * @private
   */
  private static async timerTask(): Promise<void> {
    GlobalCache.ANSWER_TIME_CHANNEL_CACHE.clear();

    const socketChannelCache: Map<string, Socket> = GlobalCache.CHANNEL_CACHE;
    for (const [key, socketChannel] of socketChannelCache) {
      // 定义重试次数
      let tryTimes: number = 3;
      while (tryTimes > 0) {
        const startTime: bigint = BigInt(new Date().valueOf());
        // 构建心跳请求
        const noomiRpcRequest: NoomiRpcRequest = new NoomiRpcRequest();
        const requestId: bigint = NoomiRpcStarter.getInstance()
          .getConfiguration()
          .idGenerator.getId();
        noomiRpcRequest.setRequestId(requestId);
        noomiRpcRequest.setRequestType(RequestType.HEART_BEAT_REQUEST);
        noomiRpcRequest.setSerializeType(
          SerializerFactory.getSerializer(
            NoomiRpcStarter.getInstance().getConfiguration().serializerType
          ).code
        );
        noomiRpcRequest.setCompressType(
          CompressorFactory.getCompressor(
            NoomiRpcStarter.getInstance().getConfiguration().compressorType
          ).code
        );
        noomiRpcRequest.setDescriptionId(requestId);
        let endTime: bigint = 0n;
        try {
          await HandlerFactory.handleConsumerRequestAndResponse(socketChannel, noomiRpcRequest);
          endTime = BigInt(new Date().valueOf());
        } catch (error) {
          tryTimes--;
          Logger.error(
            TipManager.getError(
              "0401",
              socketChannel.remoteAddress,
              socketChannel.remotePort,
              3 - tryTimes
            )
          );
          if (tryTimes === 0) {
            GlobalCache.CHANNEL_CACHE.delete(key);
          }
          // 随机过一段时间再重试
          await new Promise((resolve): void => {
            setTimeout(
              function () {
                resolve("");
              },
              10 * Math.floor(Math.random() * 5)
            );
          });
          continue;
        }
        const duringTime: bigint = endTime - startTime;
        GlobalCache.ANSWER_TIME_CHANNEL_CACHE.set(duringTime, socketChannel);
        Logger.debug(TipManager.getTip("0130", key, duringTime));
        break;
      }
    }

    Logger.debug("------------------------响应时间的Socket通道-------------------------------");
    const keys: bigint[] = Array.from(GlobalCache.ANSWER_TIME_CHANNEL_CACHE.keys()).sort();
    for (const key of keys) {
      const socketChannel: Socket = GlobalCache.ANSWER_TIME_CHANNEL_CACHE.get(key);
      Logger.debug(
        `${socketChannel.remoteAddress}:${socketChannel.remotePort}通道的响应时间为：${key}。`
      );
    }
  }

  /**
   * 定时发送心跳给服务端，判断socket通道是否健康
   * @param serviceName 服务名称
   */
  public static async detectHeartbeat(serviceName: string): Promise<void> {
    const registry: Registry = NoomiRpcStarter.getInstance()
      .getConfiguration()
      .registryConfig.getRegistry();
    const serviceNodes: Array<string> = await registry.lookup(serviceName);
    for (const serviceNode of serviceNodes) {
      if (!GlobalCache.CHANNEL_CACHE.has(serviceNode)) {
        const [address, port]: AddressPort = NetUtil.parseAddress(serviceNode);
        const socketChannel: Socket = Application.net.createConnection(port, address);
        socketChannel.setKeepAlive(true);
        GlobalCache.CHANNEL_CACHE.set(serviceNode, socketChannel);
      }
    }

    setInterval(this.timerTask, Constant.HEART_BEAT_CHECK_INTERVAL);
  }
}
