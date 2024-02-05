import {ServiceConfig} from "../../ServiceConfig";
import {Starter} from "../../index";

/**
 * 服务选项
 */
interface ServiceOption<T, V extends Object> {
    /**
     * 服务提供接口
     */
    interfaceProvider: T;

    /**
     * 接口描述
     */
    interfaceDescription: V;
}

/**
 * 服务装饰器，装饰类
 * @constructor
 */
export function NoomiService<T, V extends Object>(serviceOption: ServiceOption<T, V>): (target: Function) => void {
    return async (target: Function): Promise<void> => {
        const service: ServiceConfig<T, V> = new ServiceConfig<T, V>();
        service.interfaceProvider = serviceOption.interfaceProvider;
        service.interfaceDescription = serviceOption.interfaceDescription;
        service.ref = Reflect.construct(target, []);
        await Starter.getInstance().publish(service);
    }
}
