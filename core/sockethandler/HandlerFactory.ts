import { Handler } from "./Handler";
import { NoomiRpcRequest } from "../message/NoomiRpcRequest";
import { NoomiRpcResponseEncoder } from "./handler/NoomiRpcResponseEncoder";
import { NoomiRpcRequestEncoder } from "./handler/NoomiRpcRequestEncoder";
import { NoomiRpcResponseDecoder } from "./handler/NoomiRpcResponseDecoder";
import { ResultInBoundHandler } from "./handler/ResultInBoundHandler";
import { MethodCallInBoundHandler } from "./handler/MethodCallInBoundHandler";
import { NoomiRpcRequestDecoder } from "./handler/NoomiRpcRequestDecoder";
import { Logger } from "../common/logger/Logger";
import { CircuitBreaker } from "../sentinel/circuitbreak/CircuitBreaker";
import { RequestType } from "../code/RequestType";
import { GlobalCache } from "../cache/GlobalCache";
import { AddressPort, NetUtil } from "../common/utils/NetUtil";
import { LoadBalancerFactory } from "../loadbalance/LoadBalancerFactory";
import { NoomiRpcStarter } from "../NoomiRpcStarter";
import { CircuitBreakerFactory } from "../sentinel/circuitbreak/CircuitBreakerFactory";
import { Socket } from "../common/utils/TypesUtil";
import { Application } from "../common/utils/ApplicationUtil";
import { NoomiRpcError } from "../common/error/NoomiRpcError";
import { TipManager } from "../common/error/TipManager";

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
   * 是否初始化完成服务调用方handler
   * @private
   */
  private static isInitialConsumerHandler: boolean = false;

  /**
   * 是否初始化完成服务提供方handler
   * @private
   */
  private static isInitialProviderHandler: boolean = false;

  /**
   * 添加handler
   * @param category handler类别
   * @param handler 处理器
   */
  private static addHandler(category: string, handler: Handler): void {
    if (!category) {
      throw new NoomiRpcError("0402");
    }
    if (!handler) {
      throw new NoomiRpcError("0403");
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
  public static async handleConsumerRequestAndResponse(
    socketChannel: Socket,
    noomiRpcRequest: NoomiRpcRequest
  ): Promise<unknown> {
    // 初始化客户端handler
    if (!this.isInitialConsumerHandler) {
      this.initHandler("consumer");
      this.isInitialConsumerHandler = true;
    }
    let tryTimes: number = 3;
    const intervalTime: number = 2000;
    let circuitBreaker: CircuitBreaker;
    while (true) {
      if (!socketChannel) {
        const serviceNode: string = await LoadBalancerFactory.getLoadBalancer(
          NoomiRpcStarter.getInstance().getConfiguration().loadBalancerType
        ).impl.selectServerAddress(noomiRpcRequest.getRequestPayload().getServiceName());
        socketChannel = GlobalCache.CHANNEL_CACHE.get(serviceNode);
        if (!socketChannel) {
          const [address, port]: AddressPort = NetUtil.parseAddress(serviceNode);
          socketChannel = Application.net.createConnection(port, address);
          socketChannel.setKeepAlive(true);
          GlobalCache.CHANNEL_CACHE.set(serviceNode, socketChannel);
        }
      }
      const everyIpCircuitBreaker: Map<string, CircuitBreaker> =
        NoomiRpcStarter.getInstance().getConfiguration().everyIpCircuitBreaker;
      const serviceNode: string = socketChannel.remoteAddress + ":" + socketChannel.remotePort;
      circuitBreaker = everyIpCircuitBreaker.get(serviceNode);
      if (!circuitBreaker) {
        circuitBreaker = CircuitBreakerFactory.getCircuitBreaker(
          NoomiRpcStarter.getInstance().getConfiguration().circuitBreakerType
        );
        everyIpCircuitBreaker.set(serviceNode, circuitBreaker);
      }

      try {
        if (
          !(noomiRpcRequest.getRequestType() === RequestType.HEART_BEAT_REQUEST) &&
          circuitBreaker.isBreak()
        ) {
          throw new NoomiRpcError("0704");
        }
        console.time("noomi-rpc-node执行请求响应时间");
        // 发送请求
        this.execute(socketChannel, "ConsumerOutBound", noomiRpcRequest).then();

        // 监听请求
        const result = await new Promise<unknown>((resolve, reject): void => {
          socketChannel.on("data", async (data: Buffer): Promise<void> => {
            try {
              const executeResult: unknown = await this.execute(
                socketChannel,
                "ConsumerInBound",
                data
              );
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
        console.timeEnd("noomi-rpc-node执行请求响应时间");
        if (result instanceof Error) {
          throw result;
        }
        circuitBreaker.recordRequest();
        return result;
      } catch (error) {
        tryTimes--;
        circuitBreaker.recordErrorRequest();
        await new Promise((resolve): void => {
          setTimeout(function (): void {
            resolve(null);
          }, intervalTime);
        });
        if (tryTimes < 0) {
          Logger.error(
            TipManager.getError(
              "0705",
              noomiRpcRequest.getRequestPayload().getMethodName(),
              2 - tryTimes
            )
          );
          break;
        }
        Logger.error(TipManager.getError("0706", 3 - tryTimes));
      }
    }
  }

  /**
   * 处理服务端请求和响应
   * @param socketChannel socket通道
   */
  public static async handleProviderRequestAndResponse(socketChannel: Socket): Promise<void> {
    // 初始化服务端handler
    if (!this.isInitialProviderHandler) {
      this.initHandler("provider");
      this.isInitialProviderHandler = true;
    }
    // 监听请求
    socketChannel.on("data", async (data: Buffer): Promise<void> => {
      try {
        await this.execute(socketChannel, "ProviderHandler", data);
      } catch (error) {
        Logger.error(error.message);
      }
    });

    socketChannel.on("error", (error: Error): void => {
      socketChannel.destroy(error);
      Logger.error(error.message);
    });
  }

  /**
   * 初始化服务端和客户端handler
   * @param item 客户端consumer或者服务端provider
   * @private
   */
  private static initHandler(item: "consumer" | "provider"): void {
    if (item === "consumer") {
      this.addHandler("ConsumerOutBound", new NoomiRpcRequestEncoder());
      this.addHandler("ConsumerInBound", new NoomiRpcResponseDecoder());
      this.addHandler("ConsumerInBound", new ResultInBoundHandler());
    } else {
      this.addHandler("ProviderHandler", new NoomiRpcRequestDecoder());
      this.addHandler("ProviderHandler", new MethodCallInBoundHandler());
      this.addHandler("ProviderHandler", new NoomiRpcResponseEncoder());
    }
  }

  /**
   * 执行handler链
   * @param socketChannel socket通道
   * @param category handler链分类
   * @param data 数据
   */
  private static async execute(
    socketChannel: Socket,
    category: string,
    data?: unknown
  ): Promise<unknown> {
    let result: unknown = data;
    for (const handlerCategory of this.handlerChain.keys()) {
      if (handlerCategory === category) {
        for (const handler of this.handlerChain.get(category)) {
          result = await handler.process(socketChannel, result);
        }
        return result;
      }
    }
    throw new NoomiRpcError("0404");
  }
}
