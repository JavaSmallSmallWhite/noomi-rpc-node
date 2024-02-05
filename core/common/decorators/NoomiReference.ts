import {Starter} from "../../index";
import {ReferenceConfig} from "../../ReferenceConfig";

/**
 * 代理选项
 */
interface ReferenceOption<T, V extends Object> {
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
 * 代理装饰器，装饰属性
 * @constructor
 */
export function NoomiReference<T, V extends Object>(referenceOption: ReferenceOption<T, V>): (target: Object, propertyKey: string | symbol) => void {
    return async (target: Object, propertyKey: string | symbol): Promise<void> => {
        const reference: ReferenceConfig<T, V> = new ReferenceConfig<T, V>();
        reference.interfaceRef = referenceOption.interfaceProvider;
        // 设置接口描述
        reference.interfaceDescription = referenceOption.interfaceDescription;
        Starter.getInstance().reference(reference).then();

        Object.defineProperty(target, propertyKey, {
            get: () => reference.get(),
            enumerable: true,
            configurable: true
        })
    }
}
