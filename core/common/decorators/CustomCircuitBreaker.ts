import {NoomiRpcStarter} from "../../NoomiRpcStarter";
import {CircuitBreakerFactory} from "../../sentinel/circuitbreak/CircuitBreakerFactory";

/**
 * 自定义添加熔断器的选项
 */
export interface CircuitBreakerOption {

    /**
     * 自定义的熔断器参数，new的时候传的
     */
    circuitBreakerArguments: Array<unknown>,

    /**
     * 熔断器名称，不可与框架自带的熔断器名称重复
     */
    circuitBreakerName?: string,

    /**
     * 是否使用
     */
    isUse?: boolean,
}

/**
 * 熔断装饰器，用于添加自定义的熔断器，装饰类
 * @constructor
 */
export function CustomCircuitBreaker(circuitBreakerOption: CircuitBreakerOption): (target: Function) => void {
    return (target: Function): void => {
        const circuitBreakerName: string = circuitBreakerOption["circuitBreakerName"] || target.name
        CircuitBreakerFactory.addCircuitBreaker(circuitBreakerName,
            Reflect.construct(target, circuitBreakerOption.circuitBreakerArguments));
        if (circuitBreakerOption["isUse"]) {
            NoomiRpcStarter.getInstance().getConfiguration().circuitBreakerType = circuitBreakerName;
        }
    }
}
