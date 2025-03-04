/**
 * 事件类型
 */
type Handler = (...args: unknown[]) => void;

/**
 * 事件对象类型
 */
type EventHandler = {
  handler: Handler;
  scope: object | undefined;
};

/**
 * 事件对象链类型
 */
type EventHandlerChain = Array<EventHandler>;

/**
 * 事件总线接口
 */
export interface EventBusInterface {
  /**
   * 添加事件监听器
   * @param key 事件名称
   * @param handler 事件
   * @param scope this指向
   */
  addListener(key: string, handler: Handler, scope?: object): void;
  /**
   * 移除事件监听器
   * @param key 事件名称
   */
  removeListener(key: string): void;
  /**
   * 清空事件集合
   */
  removeAllListener(): void;
  /**
   * 移除事件的某个handler
   * @param key 事件名称
   * @param handler 处理器
   */
  removeHandler(key: string, handler: Handler): void;
  /**
   * 通过scope移除handler
   * @param scope handler指向
   */
  removeHandlerByScope<T>(scope: ThisType<T>): void;
  /**
   * 执行事件监听器
   * @param key 事件名称
   * @param args 处理器参数
   * @param scope 处理器的指向
   */
  dispatch<T>(key: string, args: unknown[], scope?: ThisType<T>): void;
}

/**
 * 事件总线，暂时不用于项目
 */
export class EventBus implements EventBusInterface {
  /**
   * 事件缓存集合
   * @private
   */
  #eventMap: Map<string, EventHandlerChain> = new Map<string, EventHandlerChain>();

  /**
   * 添加事件监听器
   * @param key 事件名称
   * @param handler 事件
   * @param scope this指向
   */
  public addListener(key: string, handler: Handler, scope?: object): void {
    const eventHandlerChain = this.#eventMap.get(key);
    const newEventHandler = { handler: handler, scope: scope };
    if (!eventHandlerChain) {
      this.#eventMap.set(key, [newEventHandler]);
      return;
    }
    const canAdd = eventHandlerChain.every((eventHandler) => {
      const isDifferentHandler = handler !== null && handler !== eventHandler.handler;
      const isDifferentScope = scope !== null && scope !== eventHandler.scope;
      return isDifferentHandler || isDifferentScope;
    });
    if (!canAdd) {
      eventHandlerChain.push(newEventHandler);
    }
  }

  /**
   * 移除事件监听器
   * @param key 事件名称
   */
  public removeListener(key: string): void {
    const handlerChain = this.#eventMap.get(key);
    if (!handlerChain) {
      handlerChain.length = 0;
    }
  }

  /**
   * 执行事件监听器
   * @param key 事件名称
   * @param args 处理器参数
   * @param scope 处理器的指向
   */
  public dispatch<T>(key: string, args: unknown[], scope: ThisType<T>): void {
    const eventHandlerChain = this.#eventMap.get(key);
    if (!eventHandlerChain) {
      eventHandlerChain.forEach((eventHandler) => {
        eventHandler.handler.call(scope, args);
      });
    }
  }

  /**
   * 清空事件集合
   */
  public removeAllListener(): void {
    this.#eventMap.clear();
  }

  /**
   * 移除事件的某个handler
   * @param key 事件名称
   * @param handler 处理器
   */
  public removeHandler(key: string, handler: Handler): void {
    const handlerChain = this.#eventMap.get(key);
    if (!handlerChain && handler) {
      this.#eventMap[key] = handlerChain.filter((item) => item.handler != handler);
    }
  }

  /**
   * 通过scope移除handler
   * @param scope handler指向
   */
  public removeHandlerByScope<T>(scope: ThisType<T>): void {
    if (scope && typeof scope === "object") {
      Object.keys(this.#eventMap).forEach((key) => {
        const eventHandlerChain = this.#eventMap.get(key);
        if (eventHandlerChain.length !== 0) {
          const newEventHandlerChain = eventHandlerChain.filter(
            (eventHandler) => eventHandler.scope !== scope
          );
          this.#eventMap.set(key, newEventHandlerChain);
        }
      });
    }
  }
}

// type Handler<T = any> = (event: T) => void;
// type WildcardHandler<T = Record<string, any>> = (type: keyof T, event: T[keyof T]) => void;
// type EventType = string | symbol;
//
// interface EventBusInterface<T extends Record<EventType, any>> {
//   on<K extends keyof T>(type: K, handler: Handler<T[K]>): void;
//   on(type: "*", handler: WildcardHandler<T>): void;
//
//   off<K extends keyof T>(type: K, handler?: Handler<T[K]>): void;
//   off(type: "*", handler: WildcardHandler<T>): void;
//
//   emit<K extends keyof T>(type: K, event: T[K]): void;
//   once<K extends keyof T>(type: K, handler: Handler<T[K]>): void;
// }
//
// class EventBus<T extends Record<EventType, any>> implements EventBusInterface<T> {
//   private handlers = new Map<keyof T | "*", Set<Handler | WildcardHandler>>();
//
//   // 订阅事件
//   on<K extends keyof T>(type: K, handler: Handler<T[K]>): void;
//   on(type: "*", handler: WildcardHandler<T>): void;
//   on(type: any, handler: any): void {
//     if (!this.handlers.has(type)) {
//       this.handlers.set(type, new Set());
//     }
//     this.handlers.get(type)?.add(handler);
//   }
//
//   // 取消订阅
//   off<K extends keyof T>(type: K, handler?: Handler<T[K]>): void;
//   off(type: "*", handler: WildcardHandler<T>): void;
//   off(type: any, handler?: any): void {
//     if (!handler) {
//       this.handlers.delete(type);
//       return;
//     }
//
//     const handlers = this.handlers.get(type);
//     if (handlers) {
//       handlers.delete(handler);
//       if (handlers.size === 0) {
//         this.handlers.delete(type);
//       }
//     }
//   }
//
//   // 触发事件
//   emit<K extends keyof T>(type: K, event: T[K]) {
//     // 处理普通事件
//     const typeHandlers = this.handlers.get(type);
//     if (typeHandlers) {
//       typeHandlers.forEach((handler) => (handler as Handler)(event));
//     }
//
//     // 处理通配符事件
//     const wildcardHandlers = this.handlers.get("*");
//     if (wildcardHandlers) {
//       wildcardHandlers.forEach((handler) => (handler as WildcardHandler<T>)(type, event));
//     }
//   }
//
//   // 单次订阅
//   once<K extends keyof T>(type: K, handler: Handler<T[K]>): void {
//     const wrapper = (event: T[K]) => {
//       handler(event);
//       this.off(type, wrapper);
//     };
//     this.on(type, wrapper);
//   }
//
//   // 清空所有事件
//   clear() {
//     this.handlers.clear();
//   }
// }
//
// // 使用示例
// interface AppEvents {
//   login: { username: string };
//   logout: void;
//   error: Error;
// }
//
// // 创建 EventBus 实例
// const bus = new EventBus<AppEvents>();
//
// // 订阅登录事件
// bus.on("login", (user) => {
//   console.log(`User logged in: ${user.username}`);
// });
//
// // 订阅通配符事件
// bus.on("*", (type, event) => {
//   console.log(`Event ${String(type)} triggered:`, event);
// });
//
// // 触发登录事件
// bus.emit("login", { username: "Alice" });
//
// // 单次订阅错误事件
// bus.once("error", (err) => {
//   console.error("Error occurred:", err.message);
// });
//
// // 触发错误事件
// bus.emit("error", new Error("Connection failed"));
//
// // 取消所有事件监听
// bus.clear();
