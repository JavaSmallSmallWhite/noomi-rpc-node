import {InterfaceMethodProxy} from "./proxy/InterfaceMethodProxy";
import {Logger} from "./common/logger/Logger";
import {InterfaceUtil} from "./common/utils/InterfaceUtil";
import {Starter} from "./index";

/**
 * 代理对象管理类
 */
export class ReferenceConfig<T, V extends Object> {

    /**
     * 接口对象
     * @private
     */
    private _interfaceRef: T;

    /**
     * 接口描述
     * @private
     */
    private _interfaceDescription: V;

    /**
     * 接口方法的代理，一开始就加载
     * @private
     */
    private interfaceMethodProxy: InterfaceMethodProxy<T> = new InterfaceMethodProxy<T>();

    /**
     * 服务前缀
     * @private
     */
    private _servicePrefix: string;

    /**
     * 获取代理对象，所有的操作都通过代理对象去进行
     */
    public get(): T {
        this.servicePrefix ||= Starter.getInstance().getConfiguration().servicePrefix;
        const proxy: T =  this.interfaceMethodProxy.createProxyForInterface(this.interfaceRef, this.servicePrefix);
        Logger.info("接口对象" + InterfaceUtil.getInterfaceName(proxy) + "的代理对象创建成功。");
        return proxy;
    }

    /**
     * ----------------------下面是各个成员属性的getter和setter方法-------------------------------
     */
    get interfaceRef(): T {
        return this._interfaceRef;
    }

    set interfaceRef(value: T) {
        this._interfaceRef = value;
    }

    get interfaceDescription(): V {
        return this._interfaceDescription;
    }

    set interfaceDescription(value: V) {
        this._interfaceDescription = value;
    }

    get servicePrefix(): string {
        return this._servicePrefix;
    }

    set servicePrefix(value: string) {
        this._servicePrefix = value;
    }
}
