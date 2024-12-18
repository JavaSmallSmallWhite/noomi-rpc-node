import { BufferToMessageDecoderHandler } from "../BufferToMessageDecoderHandler";
import { NoomiRpcResponse } from "../../message/NoomiRpcResponse";
import { Logger } from "../../common/logger/Logger";
import { MessageConstant } from "../../message/MessageConstant";
import { Compressor } from "../../compress/Compressor";
import { CompressorFactory } from "../../compress/CompressorFactory";
import { Serializer } from "../../serialize/Serializer";
import { SerializerFactory } from "../../serialize/SerializerFactory";
import { ResponsePayload } from "../../message/ResponsePayload";
import { Socket } from "../../common/utils/TypesUtil";
import { InterfaceUtil } from "../../common/utils/InterfaceUtil";
import { NoomiRpcError } from "../../common/error/NoomiRpcError";
import { TipManager } from "../../common/error/TipManager";

/**
 * 响应解码器
 */
export class NoomiRpcResponseDecoder extends BufferToMessageDecoderHandler<NoomiRpcResponse> {
  /**
   * 响应解码
   * @param _socketChannel socket通道
   * @param responseBuffer 响应流
   */
  protected async decode(
    _socketChannel: Socket,
    responseBuffer: Buffer
  ): Promise<NoomiRpcResponse> {
    Logger.debug(TipManager.getTip("0147"));

    // 偏移量指针
    let index: number = 0;

    // 解析魔术指
    const magic: string = responseBuffer
      .subarray(index, index + MessageConstant.MAGIC_FIELD_LENGTH)
      .toString();
    index += MessageConstant.MAGIC_FIELD_LENGTH;
    if (magic !== MessageConstant.MAGIC.toString()) {
      throw new NoomiRpcError("0407");
    }

    // 解析版本
    const version: number = responseBuffer.readUInt8(index);
    index += MessageConstant.VERSION_FIELD_LENGTH;
    if (version > MessageConstant.VERSION) {
      throw new NoomiRpcError("0408");
    }

    // 解析头部长度
    // const headLength: number = responseBuffer.readUInt16BE(index);
    index += MessageConstant.HEADER_FIELD_LENGTH;

    // 解析总长度
    const fullLength: number = responseBuffer.readUint32BE(index);
    index += MessageConstant.FULL_FIELD_LENGTH;

    // 解析响应类型
    const responseType: number = responseBuffer.readUInt8(index);
    index += MessageConstant.REQUEST_TYPE_FIELD_LENGTH;

    // 解析序列化类型
    const serializeType: number = responseBuffer.readUInt8(index);
    index += MessageConstant.SERIALIZER_TYPE_FIELD_LENGTH;

    // 解析压缩类型
    const compressType: number = responseBuffer.readUInt8(index);
    index += MessageConstant.COMPRESSOR_TYPE_FIELD_LENGTH;

    // 解析请求id
    const requestId: bigint = responseBuffer.readBigInt64BE(index);
    index += MessageConstant.REQUEST_ID_FIELD_LENGTH;

    // 解析serviceName长度
    const serviceNameSize: number = responseBuffer.readUInt16BE(index);
    index += MessageConstant.SERVICE_NAME_SIZE_FIELD_LENGTH;

    // 解析methodName长度
    const methodNameSize: number = responseBuffer.readUInt16BE(index);
    index += MessageConstant.METHOD_NAME_SIZE_FIELD_LENGTH;

    const noomiRpcResponse: NoomiRpcResponse = new NoomiRpcResponse();
    noomiRpcResponse.setResponseType(responseType);
    noomiRpcResponse.setCompressType(compressType);
    noomiRpcResponse.setSerializeType(serializeType);
    noomiRpcResponse.setRequestId(requestId);

    let bodyBuffer: Uint8Array = responseBuffer.subarray(index, fullLength);
    if (bodyBuffer !== null && bodyBuffer.length !== 0) {
      // 解压缩
      const compressor: Compressor = CompressorFactory.getCompressor(compressType).impl;
      bodyBuffer = await compressor.decompress(bodyBuffer);

      // 反序列化
      const serializer: Serializer = SerializerFactory.getSerializer(serializeType).impl;
      // const result: ResponsePayload = <ResponsePayload>(
      //   await SerializerFactory.payloadDeserialize(
      //     serializer,
      //     bodyBuffer,
      //     "client",
      //     serviceNameSize,
      //     methodNameSize,
      //     responsePayload
      //   )
      // );
      // 截取serviceName buffer
      const serviceNameBuffer = bodyBuffer.subarray(0, serviceNameSize);
      // 截取methodName buffer
      const methodNameBuffer = bodyBuffer.subarray(
        serviceNameSize,
        serviceNameSize + methodNameSize
      );
      // 截取argumentsList buffer
      const resultBuffer = bodyBuffer.subarray(serviceNameSize + methodNameSize);
      // 反序列化为serviceName
      const serviceNameDescription = InterfaceUtil.executeFunction(
        serializer.getServiceNameDescription
      );
      const serviceName = <string>(
        await serializer.deserialize(serviceNameBuffer, serviceNameDescription)
      );
      // 反序列化为methodName
      const methodNameDescription = InterfaceUtil.executeFunction(
        serializer.getMethodNameDescription
      );
      const methodName = <string>(
        await serializer.deserialize(methodNameBuffer, methodNameDescription)
      );
      const description = InterfaceUtil.executeFunction(
        serializer.getDataDescription,
        "client",
        serviceName,
        methodName,
        1
      );
      const result = await serializer.deserialize(resultBuffer, description);
      const responsePayload = new ResponsePayload();
      responsePayload.setServiceName(serviceName);
      responsePayload.setMethodName(methodName);
      responsePayload.setReturnValue(result);
      noomiRpcResponse.setResponseBody(responsePayload);
      Logger.debug(TipManager.getTip("0148", requestId));
    }
    return noomiRpcResponse;
  }
}
