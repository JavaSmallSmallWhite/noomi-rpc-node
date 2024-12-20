import { Logger } from "../common/logger/Logger";

/**
 * 请求body的封装
 */
export class RequestPayload {
  /**
   * 服务名
   * @private
   */
  private serviceName: string;

  /**
   * 方法名
   * @private
   */
  private methodName: string;

  /**
   * 参数列表
   * @private
   */
  private argumentsList: Array<unknown>;

  /**
   * token
   * @private
   */
  private token: string;

  /**
   * -----------------------------以下是属性的getter和setter方法----------------------------------------
   */
  public getServiceName(): string {
    return this.serviceName;
  }

  public setServiceName(serviceName: string): void {
    this.serviceName = serviceName;
  }

  public getMethodName(): string {
    return this.methodName;
  }

  public setMethodName(methodName: string) {
    this.methodName = methodName;
  }

  public getArgumentsList(): Array<unknown> {
    return this.argumentsList;
  }

  public setArgumentsList(argumentsList: Array<unknown>) {
    this.argumentsList = argumentsList;
  }

  public getToken(): string {
    return this.token;
  }

  public setToken(token: string) {
    this.token = token;
  }
}
