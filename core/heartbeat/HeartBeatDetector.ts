import {NoomiRpcStarter} from "../NoomiRpcStarter";
import {Registry} from "../discovery/Registry";
import {createConnection, Socket} from "net";
import {AddressPort, NetUtil} from "../common/utils/NetUtil";
import {NoomiRpcRequest} from "../message/NoomiRpcRequest";
import {RequestType} from "../code/RequestType";
import {SerializerFactory} from "../serialize/SerializerFactory";
import {CompressorFactory} from "../compress/CompressorFactory";
import {HandlerFactory} from "../sockethandler/HandlerFactory";
import {Logger} from "../common/logger/Logger";
import {GlobalCache} from "../cache/GlobalCache";
import {Starter} from "../index";

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

        let socketChannelCache: Map<string, Socket> = GlobalCache.CHANNEL_CACHE;
        for (const [key, socketChannel] of socketChannelCache) {
            // 定义重试次数
            let tryTimes: number = 3;
            while (tryTimes > 0) {
                const startTime: bigint = BigInt(new Date().valueOf());
                // 构建心跳请求
                const noomiRpcRequest: NoomiRpcRequest = new NoomiRpcRequest();
                const requestId: bigint = Starter.getInstance().getConfiguration().idGenerator.getId();
                noomiRpcRequest.setRequestId(requestId);
                noomiRpcRequest.setRequestType(RequestType.HEART_BEAT_REQUEST);
                noomiRpcRequest.setSerializeType(SerializerFactory.getSerializer(Starter.getInstance().getConfiguration().serializerType).code);
                noomiRpcRequest.setCompressType(CompressorFactory.getCompressor(Starter.getInstance().getConfiguration().compressorType).code);
                noomiRpcRequest.setOther(requestId);
                let endTime: bigint = 0n;
                try {
                    await HandlerFactory.handleConsumerRequestAndResponse(socketChannel, noomiRpcRequest);
                    endTime = BigInt(new Date().valueOf());
                } catch (error) {
                    tryTimes--;
                    Logger.error(`和地址为${socketChannel.remoteAddress}:${socketChannel.remotePort}的主机连接发生异常，正在进行第${3 - tryTimes}次重试....`);
                    if (tryTimes === 0) {
                        GlobalCache.CHANNEL_CACHE.delete(key);
                    }
                    // 随机过一段时间再重试
                    await new Promise((resolve): void => {
                        setTimeout(function () {
                            resolve("")
                        }, 10 * Math.floor(Math.random() * 5))
                    })
                    continue;
                }
                const duringTime: bigint = endTime - startTime;
                GlobalCache.ANSWER_TIME_CHANNEL_CACHE.set(duringTime, socketChannel);
                Logger.debug(`和${key}服务器的响应时间是${duringTime}`);
                break;
            }
        }

        Logger.debug("------------------------响应时间的Socket通道-------------------------------");
        const keys: bigint[] = Array.from(GlobalCache.ANSWER_TIME_CHANNEL_CACHE.keys()).sort();
        for (const key of keys) {
            const socketChannel: Socket = GlobalCache.ANSWER_TIME_CHANNEL_CACHE.get(key);
            Logger.debug(`${socketChannel.remoteAddress}:${socketChannel.remotePort}通道的响应时间为：${key}。`)
        }
    }

    /**
     * 定时发送心跳给服务端，判断socket通道是否健康
     * @param serviceName 服务名称
     */
    public static async detectHeartbeat(serviceName: string): Promise<void> {
        const registry: Registry = Starter.getInstance().getConfiguration().registryConfig.getRegistry();
        const serviceNodes: Array<string> = await registry.lookup(serviceName)
        for (const serviceNode of serviceNodes) {
            if (!GlobalCache.CHANNEL_CACHE.has(serviceNode)) {
                const [address, port]: AddressPort = NetUtil.parseAddress(serviceNode);
                const socketChannel: Socket = createConnection(port, address);
                socketChannel.setKeepAlive(true);
                GlobalCache.CHANNEL_CACHE.set(serviceNode, socketChannel);
            }
        }

        setInterval(this.timerTask, 2000);
    }
}
