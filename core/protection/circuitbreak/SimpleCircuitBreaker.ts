import {CircuitBreaker} from "./CircuitBreaker";

/**
 * 简单熔断器实现
 */
export class SimpleCircuitBreaker implements CircuitBreaker {

    /**
     * todo 熔断器是否打开，包含三种转台 open close half-open，暂时只做open close两种
     * @private
     */
    private isOpen: boolean = false;

    /**
     * 总请求数
     * @private
     */
    private requestCount: number = 0;

    /**
     * 异常的请求数
     * @private
     */
    private errorRequest: number = 0;

    /**
     * 最大的错误请求数
     * @private
     */
    private readonly maxErrorRequest: number;

    /**
     * 初始化最大的错误请求数和最大的异常阈值
     * @param maxErrorRequest 最大的错误请求数
     * @private
     */
    public constructor(maxErrorRequest: number) {
        this.maxErrorRequest = maxErrorRequest;
    }

    /**
     * 判断熔断器是否开启
     * true 开启 false 关闭
     */
    public isBreak(): boolean {
        if (this.isOpen) {
            return true;
        }

        if (this.errorRequest > this.maxErrorRequest) {
            this.isOpen = true;
            return true;
        }

        if (this.errorRequest > 0 && this.requestCount > 0 && this.errorRequest / this.requestCount > this.maxErrorRequest) {
            this.isOpen = true;
            return true;
        }

        return false;
    }

    /**
     * 记录请求
     */
    public recordRequest(): void {
        this.requestCount++;
    }

    /**
     * 记录错误请求
     */
    public recordErrorRequest(): void {
        this.errorRequest++;
    }

    /**
     * 重置
     */
    public reset(): void {
        this.isOpen = false;
        this.requestCount = 0;
        this.errorRequest = 0;
    }
}
