import {CircuitBreaker} from "./CircuitBreaker";
import {SimpleCircuitBreaker} from "./impl/SimpleCircuitBreaker";
import {Constant} from "../../common/utils/Constant";
import {SeniorCircuitBreaker} from "./impl/SeniorCircuitBreaker";
import {Logger} from "../../common/logger/Logger";
import {CircuitBreakerError} from "../../common/error/CircuitBreakerError";

/**
 * 熔断器工厂
 */
export class CircuitBreakerFactory {

    /**
     * 熔断器缓存工厂
     * @private
     */
    private static readonly CIRCUIT_BREAKER_CACHE: Map<string, CircuitBreaker> = new Map<string, CircuitBreaker>();

    static {
        const simpleCircuitBreaker: CircuitBreaker = new SimpleCircuitBreaker(Constant.CIRCUIT_BREAKER_MAX_ERROR_REQUEST, Constant.CIRCUIT_BREAKER_MAX_ERROR_RATE);
        const seniorCircuitBreaker: CircuitBreaker = new SeniorCircuitBreaker(Constant.CIRCUIT_BREAKER_MAX_ERROR_REQUEST, Constant.CIRCUIT_BREAKER_MAX_ERROR_RATE);

        this.CIRCUIT_BREAKER_CACHE.set("SimpleCircuitBreaker", simpleCircuitBreaker);
        this.CIRCUIT_BREAKER_CACHE.set("SeniorCircuitBreaker", seniorCircuitBreaker);
    }

    /**
     * 使用工厂方法获取一个熔断器
     * @param circuitBreakerType 熔断器类型
     */
    public static getCircuitBreaker(circuitBreakerType: string): CircuitBreaker {
        const circuitBreaker: CircuitBreaker = this.CIRCUIT_BREAKER_CACHE.get(circuitBreakerType);
        if (!circuitBreaker) {
            Logger.error(`未找到您配置的${circuitBreakerType}熔断器，默认选用SeniorCircuitBreaker熔断器。`)
            return this.CIRCUIT_BREAKER_CACHE.get("SeniorCircuitBreaker");
        }
        return circuitBreaker;
    }

    /**
     * 新增一个熔断器
     * @param circuitBreakerName 熔断器名称
     * @param circuitBreaker 熔断器
     */
    public static addCircuitBreaker(circuitBreakerName: string, circuitBreaker: CircuitBreaker): void {
        if (this.CIRCUIT_BREAKER_CACHE.has(circuitBreakerName)) {
            throw new CircuitBreakerError(`熔断器名称为${circuitBreakerName}的熔断器器已存在，请使用其他名称。`);
        }
        this.CIRCUIT_BREAKER_CACHE.set(circuitBreakerName, circuitBreaker);
    }
}
