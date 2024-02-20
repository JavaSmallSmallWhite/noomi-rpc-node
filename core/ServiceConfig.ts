/**
 * 服务配置类
 */
export class ServiceConfig<T extends Object> {

    /**
     * 服务提供接口
     * @private
     */
    private _interfaceProvider: T;

    /**
     * 具体的接口实现
     * @private
     */
    private _ref: unknown;

    /**
     * 服务前缀
     * @private
     */
    private _servicePrefix: string

    /**
     * -------------------以下为成员变量的getter和setter------------------------------------
     */

    public get interfaceProvider(): T {
        return this._interfaceProvider;
    }

    public set interfaceProvider(value: T) {
        this._interfaceProvider = value;
    }

    public get ref(): unknown {
        return this._ref;
    }

    public set ref(value: unknown) {
        this._ref = value;
    }

    get servicePrefix(): string {
        return this._servicePrefix;
    }

    set servicePrefix(value: string) {
        this._servicePrefix = value;
    }
}
