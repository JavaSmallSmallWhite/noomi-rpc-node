/**
 * 熔断器接口
 */
export interface CircuitBreaker {

    /**
     * 判断熔断器是否开启
     * true 开启 false 关闭
     */
    isBreak(): boolean;

    /**
     * 记录请求
     */
    recordRequest(): void;

    /**
     * 记录错误请求
     */
    recordErrorRequest(): void;

    /**
     * 重置
     */
    reset(): void;
}
