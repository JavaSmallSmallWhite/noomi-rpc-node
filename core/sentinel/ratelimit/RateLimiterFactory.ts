import { RateLimiter } from "./RateLimiter";
import { TokenBuketRateLimiter } from "./impl/TokenBuketRateLimiter";
import { Constant } from "../../common/utils/Constant";
import { Logger } from "../../common/logger/Logger";
import { NoomiRpcError } from "../../common/error/NoomiRpcError";
import { TipManager } from "../../common/error/TipManager";

/**
 * 限流器工厂
 */
export class RateLimiterFactory {
  /**
   * 限流器缓存工厂
   * @private
   */
  private static readonly RATE_LIMITER_CACHE: Map<string, RateLimiter> = new Map<
    string,
    RateLimiter
  >();

  static {
    const tokenBuketRateLimiter: RateLimiter = new TokenBuketRateLimiter(
      Constant.TOKEN_BUKET_CAPACITY,
      Constant.TOKEN_BUKET_RATE
    );

    this.RATE_LIMITER_CACHE.set("TokenBuketRateLimiter", tokenBuketRateLimiter);
  }

  /**
   * 使用工厂方法获取一个限流器
   * @param rateLimiterType 限流器类型
   */
  public static getRateLimiter(rateLimiterType: string): RateLimiter {
    const rateLimiter: RateLimiter = this.RATE_LIMITER_CACHE.get(rateLimiterType);
    if (!rateLimiter) {
      Logger.error(TipManager.getError("0702", rateLimiterType));
      return this.RATE_LIMITER_CACHE.get("TokenBuketRateLimiter");
    }
    return rateLimiter;
  }

  /**
   * 新增一个限流器
   * @param rateLimiterName 限流器名称
   * @param rateLimiter 限流器
   */
  public static addRateLimiter(rateLimiterName: string, rateLimiter: RateLimiter): void {
    if (this.RATE_LIMITER_CACHE.has(rateLimiterName)) {
      throw new NoomiRpcError("0703", rateLimiterName);
    }
    this.RATE_LIMITER_CACHE.set(rateLimiterName, rateLimiter);
  }
}
