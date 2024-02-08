import {TypeDescription} from "@furyjs/fury";

/**
 * 服务方法的description类型
 */
export type DescriptionType = {
    methodId1: string,
    methodId2: string,
    methodName: string,
    serviceName: string
}

/**
 * 服务方法的description
 */
export type Description = {
    argumentsDescription: TypeDescription,
    returnValueDescription: TypeDescription
}

/**
 * 服务配置类
 */
export class ServiceConfig<T, V extends Object> {

    /**
     * 服务提供接口
     * @private
     */
    private _interfaceProvider: T;

    /**
     * 接口描述
     * @private
     */
    private _interfaceDescription: V;

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

    get interfaceDescription(): V {
        return this._interfaceDescription;
    }

    set interfaceDescription(value: V) {
        this._interfaceDescription = value;
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
