/**
 * 服务配置类
 */
export class ServiceConfig<T> {

    /**
     * 服务提供接口
     * @private
     */
    private _interfaceProvider: T;

    /**
     * 具体的接口实现
     * @private
     */
    private _ref: Object;

    /**
     * 服务前缀
     * @private
     */
    private _servicePrefix: string

    /**
     * -------------------以下为成员变量的getter和setter------------------------------------
     */
    get interfaceProvider(): T {
        return this._interfaceProvider;
    }

    set interfaceProvider(value: Function) {
        this._interfaceProvider = value.prototype;
    }

    get ref(): Object {
        return this._ref;
    }

    set ref(value: Function) {
        this._ref = value.prototype;
    }

    get servicePrefix(): string {
        return this._servicePrefix;
    }

    set servicePrefix(value: string) {
        this._servicePrefix = value;
    }
}
