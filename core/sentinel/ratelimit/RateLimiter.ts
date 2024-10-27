/**
 * 限流器接口
 */
export interface RateLimiter {
  /**
   * 是否允许新的请求进入
   * true 可以进入 false 拦截
   */
  allowRequest(): boolean;
}
