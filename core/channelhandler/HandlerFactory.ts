import {Handler} from "./Handler";
import {createConnection, Socket} from "net";
import {NoomiRpcRequest} from "../message/NoomiRpcRequest";
import {NoomiRpcResponseEncoder} from "./handler/NoomiRpcResponseEncoder";
import {NoomiRpcRequestEncoder} from "./handler/NoomiRpcRequestEncoder";
import {NoomiRpcResponseDecoder} from "./handler/NoomiRpcResponseDecoder";
import {ResultInBoundHandler} from "./handler/ResultInBoundHandler";
import {MethodCallInBoundHandler} from "./handler/MethodCallInBoundHandler";
import {NoomiRpcRequestDecoder} from "./handler/NoomiRpcRequestDecoder";
import {HandlerError} from "../common/error/HandlerError";
import {Logger} from "../common/logger/Logger";
import {CircuitBreaker} from "../protection/circuitbreak/CircuitBreaker";
import {Starter} from "../index";
import {SimpleCircuitBreaker} from "../protection/circuitbreak/SimpleCircuitBreaker";
import {RequestType} from "../enumeration/RequestType";
import {ProxyError} from "../common/error/ProxyError";
import {GlobalCache} from "../cache/GlobalCache";
import {AddressPort, NetUtil} from "../common/utils/NetUtil";
import {LoadBalancerFactory} from "../loadbalance/LoadBalancerFactory";

/**
 * handler处理工厂
 */
export class HandlerFactory {

    /**
     * handler链
     * @private
     */
    private static handlerChain: Map<string, Array<Handler>> = new Map<string, Array<Handler>>();

    /**
     * 是否初始化完成handler
     * @private
     */
    private static isInitialHandler: boolean = false;

    /**
     * 添加handler
     * @param category handler类别
     * @param handler 处理器
     */
    public static addHandler(category: string, handler: Handler): void {
        if (!category) {
            throw new HandlerError("handler处理器类别不合法");
        }
        if (!handler) {
            throw new HandlerError("handler处理器不合法");
        }
        if (!this.handlerChain.has(category)) {
            this.handlerChain.set(category, [handler]);
        } else {
            this.handlerChain.get(category).push(handler);
        }
    }

    /**
     * 处理客户端请求和响应
     * @param socketChannel socket通道
     * @param noomiRpcRequest 请求
     */
    public static async handleConsumerRequestAndResponse(socketChannel: Socket, noomiRpcRequest: NoomiRpcRequest): Promise<unknown> {
        // 初始化客户端handler
        if (!this.isInitialHandler) {
            this.initHandler("consumer");
            this.isInitialHandler = true;
        }
        if (!socketChannel) {
            const serviceNode: string = await LoadBalancerFactory
                .getLoadBalancer(Starter.getInstance().getConfiguration().loadBalancerType)
                .impl
                .selectServerAddress(noomiRpcRequest.getRequestPayload().getServiceName());
            socketChannel = GlobalCache.CHANNEL_CACHE.get(serviceNode);
            if (!socketChannel) {
                const [address, port]: AddressPort = NetUtil.parseAddress(serviceNode);
                socketChannel = createConnection(port, address);
                socketChannel.setKeepAlive(true);
                GlobalCache.CHANNEL_CACHE.set(serviceNode, socketChannel);
            }
        }
        let tryTimes: number = 3;
        const intervalTime: number = 2000;
        let circuitBreaker: CircuitBreaker;
        while (true) {
            try {
                const everyIpCircuitBreaker: Map<string, CircuitBreaker> = Starter.getInstance().getConfiguration().everyIpCircuitBreaker;
                const serviceNode: string = socketChannel.remoteAddress + ":" + socketChannel.remotePort;
                circuitBreaker = everyIpCircuitBreaker.get(serviceNode);
                if (!circuitBreaker) {
                    circuitBreaker = new SimpleCircuitBreaker(10);
                    everyIpCircuitBreaker.set(serviceNode, circuitBreaker);
                }

                if (!(noomiRpcRequest.getRequestType() === RequestType.HEART_BEAT_REQUEST) && circuitBreaker.isBreak()) {
                    setTimeout(function (): void {
                        Starter.getInstance().getConfiguration().everyIpCircuitBreaker.get(serviceNode).reset();
                    }, 3000);
                    Logger.error("当前断路器已经开启，无法发送请求。");
                    throw new ProxyError("当前断路器已经开启，无法发送请求。");
                }
                // 发送请求
                await this.execute(socketChannel, "ConsumerOutBound", noomiRpcRequest);

                // 监听请求
                const result: unknown | Error = await new Promise<unknown>((resolve, reject): void => {
                    socketChannel.on("data", async (data: Buffer): Promise<void> =>  {
                        try {
                            const executeResult: unknown = await this.execute(socketChannel, "ConsumerInBound", data);
                            resolve(executeResult);
                        } catch (error) {
                            reject(error);
                        }
                    });

                    socketChannel.on("error", (error: Error): void => {
                        socketChannel.destroy(error);
                        reject(error);
                    });
                });

                if (result instanceof Error) {
                    throw result;
                }
                return result;
            }catch (error) {
                tryTimes--;
                circuitBreaker.recordErrorRequest();
                await new Promise((resolve): void => {
                    setTimeout(function (): void {
                        resolve(null);
                    }, intervalTime);
                })
                if (tryTimes < 0) {
                    Logger.error(`对方法${noomiRpcRequest.getRequestPayload().getMethodName()}进行调用时，重试${3 - tryTimes - 1}次，依然不可调用。`);
                    break;
                }
                Logger.error(`在进行第${3 - tryTimes}次重试时发生异常。`);
            }
        }
    }

    /**
     * 处理服务端请求和响应
     * @param socketChannel socket通道
     */
    public static async handleProviderRequestAndResponse(socketChannel: Socket): Promise<void> {
        // 初始化服务端handler
        if (!this.isInitialHandler) {
            this.initHandler("provider");
            this.isInitialHandler = true;
        }
        // 监听请求
        socketChannel.on("data", async (data: Buffer): Promise<void> =>  {
            try {
                await this.execute(socketChannel, "ProviderHandler", data);
            } catch (error) {
                Logger.error(error.message);
            }
        })

        socketChannel.on("error", (error: Error): void => {
            socketChannel.destroy(error);
            Logger.error(error.message);
        })
    }

    /**
     * 初始化服务端和客户端handler
     * @param item 客户端consumer或者服务端provider
     * @private
     */
    private static initHandler(item: "consumer" | "provider"): void{
        if (item === "consumer") {
            this.addHandler("ConsumerOutBound", new NoomiRpcRequestEncoder());
            this.addHandler("ConsumerInBound", new NoomiRpcResponseDecoder())
            this.addHandler("ConsumerInBound", new ResultInBoundHandler())
        } else {
            this.addHandler("ProviderHandler", new NoomiRpcRequestDecoder())
            this.addHandler("ProviderHandler", new MethodCallInBoundHandler())
            this.addHandler("ProviderHandler", new NoomiRpcResponseEncoder())
        }
    }

    /**
     * 执行handler链
     * @param socketChannel socket通道
     * @param category handler链分类
     * @param data 数据
     */
    private static async execute(socketChannel: Socket, category: string, data?: unknown): Promise<unknown> {
        let result: unknown = data;
        for (const handlerCategory of this.handlerChain.keys()) {
            if (handlerCategory === category) {
                for (const handler of this.handlerChain.get(category)) {
                    result = await handler.process(socketChannel, result);
                }
                return result;
            }
        }
        throw new HandlerError(`不存在${category}类别的handler处理器`)
    }
}
