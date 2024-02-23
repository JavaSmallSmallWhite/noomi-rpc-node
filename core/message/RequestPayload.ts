import {Logger} from "../common/logger/Logger";

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
    private argumentsList: object;


    public constructor() {
        Logger.debug("创建请求体成功。");
    }


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

    public getArgumentsList(): object {
        return this.argumentsList;
    }

    public setArgumentsList(argumentsList: object) {
        this.argumentsList = argumentsList;
    }
}
