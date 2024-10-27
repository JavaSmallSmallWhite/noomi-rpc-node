import { CircuitBreaker } from "../CircuitBreaker";
import { Constant } from "../../../common/utils/Constant";

/**
 * 简单熔断器实现，只包含open close两种
 */
export class SimpleCircuitBreaker implements CircuitBreaker {
  /**
   * 熔断器的开关，初始状态是关闭
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
   * 最大错误请求率
   * @private
   */
  private readonly maxErrorRate: number;

  /**
   * 状态重置定时器
   * @private
   */
  private resetTimeout: NodeJS.Timeout;

  /**
   * 初始化最大的错误请求数和最大的异常阈值
   * @param maxErrorRequest 最大的错误请求数
   * @param maxErrorRate 最大错误请求率
   */
  public constructor(maxErrorRequest: number, maxErrorRate: number) {
    this.maxErrorRequest = maxErrorRequest;
    this.maxErrorRate = maxErrorRate;
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
      this.resetTimeout = setTimeout(() => this.reset(), Constant.STATE_CHANGE_TIME);
      return true;
    }

    if (
      this.errorRequest > 0 &&
      this.requestCount > 0 &&
      this.errorRequest / this.requestCount > this.maxErrorRate
    ) {
      this.isOpen = true;
      this.resetTimeout = setTimeout(() => this.reset(), Constant.STATE_CHANGE_TIME);
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
    clearTimeout(this.resetTimeout);
  }
}
