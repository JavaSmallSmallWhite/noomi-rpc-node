import {RateLimiter} from "./RateLimiter";

/**
 * 基于令牌桶算法的限流器具体实现
 * 单机版的限流
 */
export class TokenBuketRateLimiter implements RateLimiter {

    /**
     * 令牌数量
     * @private
     */
    private tokens: number;

    /**
     * 令牌桶的容量
     * @private
     */
    private readonly capacity: number;

    /**
     * 给令牌桶添加令牌的速率
     * @private
     */
    private rate: number;

    /**
     * 上一次访问令牌的时间
     * @private
     */
    private lastTokenTime: number;

    /**
     * 初始化令牌桶、令牌数量、速率、上次访问令牌的时间
     * @param capacity 令牌桶的容量
     * @param rate 速率
     */
    public constructor(capacity: number, rate: number) {
        this.capacity = capacity;
        this.rate = rate;
        this.lastTokenTime = Date.now();
        this.tokens = capacity;
    }

    /**
     * 判断请求是否可以放行
     * true 放行 false 拦截
     */
    public allowRequest(): boolean {
        const currentTime: number = Date.now();
        const timeInterval: number = currentTime -this.lastTokenTime;
        if (timeInterval >= 1000 / this.rate) {
            const needTokens: number = Math.floor(timeInterval * this.rate / 1000);
            this.tokens = Math.min(this.capacity, this.tokens + needTokens);
            this.lastTokenTime = Date.now();
        }
        if (this.tokens > 0) {
            this.tokens--;
            return true;
        }
        return false;
    }
}
