import {NoomiRpcStarter} from "./NoomiRpcStarter";

/**
 * 启动器的单例
 */
export class Starter {
    /**
     * 单例模式的懒汉式创建启动对象
     * @private
     */
    private static noomiRpcBootstrap: NoomiRpcStarter;

    /**
     * 获取启动器的实例
     */
    public static getInstance(): NoomiRpcStarter {
        if (this.noomiRpcBootstrap) {
            return this.noomiRpcBootstrap;
        }
        this.noomiRpcBootstrap = Reflect.construct(NoomiRpcStarter, []);
        return this.noomiRpcBootstrap;
    }
}
