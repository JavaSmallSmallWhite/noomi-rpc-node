import { CircuitBreaker } from "../CircuitBreaker";
import { Constant } from "../../../common/utils/Constant";

/**
 * 熔断器的状态
 */
enum CircuitBreakerState {
  Closed = "CLOSED",
  Open = "OPEN",
  HalfOpen = "HALF_OPEN"
}

/**
 * 高级熔断器实现，包含打开，半打开，关闭状态
 */
export class SeniorCircuitBreaker implements CircuitBreaker {
  /**
   * 熔断器的当前状态，初始状态是关闭的
   * @private
   */
  private state: CircuitBreakerState = CircuitBreakerState.Closed;

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
   * 标记半打开下的此次请求是否异常 false不正常，true正常
   * @private
   */
  private booleanRequest: boolean;

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
   * 状态重置定时器，用于异常时将状态从OPEN转为HALF_OPEN
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
   */
  public isBreak(): boolean {
    // 熔断器已经打开，直接返回true
    if (this.state === CircuitBreakerState.Open) {
      return true;
    }

    // 半打开状态，这个请求直接通过，如果这个请求出现异常，在recordErrorRequest是重新打开熔断器
    if (this.state === CircuitBreakerState.HalfOpen) {
      this.booleanRequest = true;
      return false;
    }

    // 错误请求数超过阈值，直接打开熔断器
    if (this.errorRequest > this.maxErrorRequest) {
      this.state = CircuitBreakerState.Open;
      this.resetTimeout = setTimeout(() => this.halfOpenCircuit(), Constant.STATE_CHANGE_TIME);
      return true;
    }

    // 错误请求率超过阈值，直接打开熔断器
    if (
      this.errorRequest > 0 &&
      this.requestCount > 0 &&
      this.errorRequest / this.requestCount > this.maxErrorRate
    ) {
      this.state = CircuitBreakerState.Open;
      this.resetTimeout = setTimeout(() => this.halfOpenCircuit(), Constant.STATE_CHANGE_TIME);
      return true;
    }

    // 说明熔断器是关闭状态
    return false;
  }

  /**
   * 记录错误请求数
   */
  public recordErrorRequest(): void {
    // 熔断器半打开状态，这个请求还出错，意味着熔断器还得打开。
    if (this.state === CircuitBreakerState.HalfOpen) {
      this.state = CircuitBreakerState.Open;
      this.resetTimeout = setTimeout(() => this.halfOpenCircuit(), Constant.STATE_CHANGE_TIME);
      this.booleanRequest = false;
    }
    this.errorRequest++;
  }

  /**
   * 记录请求数
   */
  public recordRequest(): void {
    // 半打开状态下booleanRequest没变成false，说明这个请求走成功了。
    if (this.booleanRequest && this.state === CircuitBreakerState.HalfOpen) {
      this.reset();
    }
    this.requestCount++;
  }

  /**
   * 重置
   */
  public reset(): void {
    this.state = CircuitBreakerState.Closed;
    this.requestCount = 0;
    this.errorRequest = 0;
    this.booleanRequest = true;
    clearTimeout(this.resetTimeout);
  }

  /**
   * 开启半打开状态
   * @private
   */
  private halfOpenCircuit(): void {
    this.state = CircuitBreakerState.HalfOpen;
  }
}
