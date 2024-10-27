import { RequestPayload } from "./RequestPayload";
import { Logger } from "../common/logger/Logger";

/**
 * 请求的封装
 *
 * 请求组成
 * 0    1    2    3    4    5    6    7    8    9    10   11   12   13   14   15   16   17   18   19   20   21   22   23   24   25   26   27   28   29   30
 * +----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+
 * /       magic       /ver /head len/      full length   / mt /ser /comp/              RequestId                /             timestamp                 /
 * +----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+
 * /                                                                                                                                                     /
 * /                                            body                                                                                                     /
 * /                                                                                                                                                     /
 * +-----------------------------------------------------------------------------------------------------------------------------------------------------+
 */
export class NoomiRpcRequest {
  /**
   * 请求id 8个字节
   * @private
   */
  private requestId: bigint;

  /**
   * 请求类型 1个字节
   * @private
   */
  private requestType: number;

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
   * description id 8个字节
   * @private
   */
  private descriptionId: bigint;

  /**
   * 请求体
   * @private
   */
  private requestPayload: RequestPayload;

  /**
   * 请求体构造器
   */
  public constructor() {
    Logger.debug("创建NoomiRpc请求成功。");
  }

  /**
   * ------------------------------以下是属性的getter和setter方法----------------------------------------
   */
  public setRequestId(requestId: bigint): void {
    this.requestId = requestId;
  }

  public getRequestId(): bigint {
    return this.requestId;
  }

  public setRequestType(requestType: number): void {
    this.requestType = requestType;
  }

  public getRequestType(): number {
    return this.requestType;
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

  public setDescriptionId(descriptionId: bigint): void {
    this.descriptionId = descriptionId;
  }

  public getDescriptionId(): bigint {
    return this.descriptionId;
  }

  public setRequestPayload(requestPayload: RequestPayload): void {
    this.requestPayload = requestPayload;
  }

  public getRequestPayload(): RequestPayload {
    return this.requestPayload;
  }
}
