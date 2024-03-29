import {NoomiRpcStarter} from "../../NoomiRpcStarter";
import {CircuitBreakerFactory} from "../../sentinel/circuitbreak/CircuitBreakerFactory";
import {RateLimiterFactory} from "../../sentinel/ratelimit/RateLimiterFactory";

/**
 * 自定义添加限流器的选项
 */
export interface RateLimiterOption {

    /**
     * 自定义的限流器参数
     */
    rateLimiterArguments: [],

    /**
     * 熔断器名称，不可与框架自带的熔断器名称重复
     */
    rateLimiterName?: string,

    /**
     * 是否使用
     */
    isUse?: boolean,
}

/**
 * 限流装饰器，用于添加自定义的限流器，装饰类
 * @constructor
 */
export function CustomRateLimiter(rateLimiterOption: RateLimiterOption): (target: Function) => void {
    return (target: Function): void => {
        const rateLimiterName: string = rateLimiterOption["rateLimiterName"] || target.name
        RateLimiterFactory.addRateLimiter(rateLimiterName,
            Reflect.construct(target, rateLimiterOption.rateLimiterArguments));
        if (rateLimiterOption["isUse"]) {
            NoomiRpcStarter.getInstance().getConfiguration().rateLimiterType = rateLimiterName;
        }
    }
}
