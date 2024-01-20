/**
 * 响应体的封装
 */
export class ResponsePayload {

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
     * 返回值
     * @private
     */
    private returnValue: unknown;

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

    public setMethodName(methodName: string): void {
        this.methodName = methodName;
    }

    public getReturnValue(): unknown {
        return this.returnValue;
    }

    public setReturnValue(value: unknown): void {
        this.returnValue = value;
    }
}
