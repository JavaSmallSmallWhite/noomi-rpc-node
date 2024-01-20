import {ResponsePayload} from "./ResponsePayload";

/**
 * 响应的封装，服务提供方回复的响应
 */
export class NoomiRpcResponse {

    /**
     * 请求id 8个字节
     * @private
     */
    private requestId: bigint;

    /**
     * 压缩类型 1个字节
     * @private
     */
    private compressType: number;

    /**
     * 序列化类型 1个字节
     * @private
     */
    private serializeType: number;

    /**
     * 时间戳 8个字节
     * @private
     */
    private other: bigint;

    /**
     * 响应码 1 成功  2 异常
     * @private
     */
    private responseType: number;

    /**
     * 响应体
     * @private
     */
    private responseBody: ResponsePayload;


    /**
     * ------------------------------以下是属性的getter和setter方法----------------------------------------
     */
    public setRequestId(requestId: bigint): void {
        this.requestId = requestId;
    }

    public getRequestId(): bigint {
        return this.requestId;
    }

    public setCompressType(compressType: number): void {
        this.compressType = compressType;
    }

    public getCompressType(): number {
        return this.compressType;
    }

    public setSerializeType(serializeType: number): void {
        this.serializeType = serializeType;
    }

    public getSerializeType(): number {
        return this.serializeType;
    }

    public setOther(other: bigint): void {
        this.other = other;
    }

    public getOther(): bigint {
        return this.other;
    }

    public setResponseType(responseType: number): void {
        this.responseType = responseType;
    }

    public getResponseType(): number {
        return this.responseType;
    }

    public setResponseBody(responseBody: ResponsePayload): void {
        this.responseBody = responseBody;
    }

    public getResponseBody(): ResponsePayload {
        return this.responseBody;
    }
}
