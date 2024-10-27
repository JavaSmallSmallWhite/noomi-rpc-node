import { MessageConstant } from "../../message/MessageConstant";
import { PacketError } from "../../common/error/PacketError";
import { NoomiRpcRequest } from "../../message/NoomiRpcRequest";
import { RequestPayload } from "../../message/RequestPayload";
import { Logger } from "../../common/logger/Logger";
import { Serializer } from "../../serialize/Serializer";
import { SerializerFactory } from "../../serialize/SerializerFactory";
import { Compressor } from "../../compress/Compressor";
import { CompressorFactory } from "../../compress/CompressorFactory";
import { BufferToMessageDecoderHandler } from "../BufferToMessageDecoderHandler";
import { Socket } from "../../common/utils/TypesUtil";
import { InterfaceUtil } from "../../common/utils/InterfaceUtil";

/**
 * 请求解码器
 */
export class NoomiRpcRequestDecoder extends BufferToMessageDecoderHandler<NoomiRpcRequest> {
  /**
   * 解析请求
   * @param _socketChannel socket通道
   * @param noomiRpcRequestBuffer 请求报文流
   */
  protected async decode(
    _socketChannel: Socket,
    noomiRpcRequestBuffer: Buffer
  ): Promise<NoomiRpcRequest> {
    Logger.debug("开始解析请求报文。");

    // 偏移量指针
    let index: number = 0;

    // 解析魔术指
    const magic: string = noomiRpcRequestBuffer
      .subarray(index, index + MessageConstant.MAGIC_FIELD_LENGTH)
      .toString();
    index += MessageConstant.MAGIC_FIELD_LENGTH;
    if (magic !== MessageConstant.MAGIC.toString()) {
      throw new PacketError("获得的请求不合法。");
    }

    // 解析版本
    const version: number = noomiRpcRequestBuffer.readUInt8(index);
    index += MessageConstant.VERSION_FIELD_LENGTH;
    if (version > MessageConstant.VERSION) {
      throw new PacketError("获得的请求版本不被支持。");
    }

    // 解析头部长度
    // const headLength: number = noomiRpcRequestBuffer.readUInt16BE(index);
    index += MessageConstant.HEADER_FIELD_LENGTH;

    // 解析总长度
    const fullLength: number = noomiRpcRequestBuffer.readUint32BE(index);
    index += MessageConstant.FULL_FIELD_LENGTH;

    // 解析请求类型
    const requestType: number = noomiRpcRequestBuffer.readUInt8(index);
    index += MessageConstant.REQUEST_TYPE_FIELD_LENGTH;

    // 解析序列化类型
    const serializeType: number = noomiRpcRequestBuffer.readUInt8(index);
    index += MessageConstant.SERIALIZER_TYPE_FIELD_LENGTH;

    // 解析压缩类型
    const compressType: number = noomiRpcRequestBuffer.readUInt8(index);
    index += MessageConstant.COMPRESSOR_TYPE_FIELD_LENGTH;

    // 解析请求id
    const requestId: bigint = noomiRpcRequestBuffer.readBigInt64BE(index);
    index += MessageConstant.REQUEST_ID_FIELD_LENGTH;

    // 解析serviceName长度
    const serviceNameSize: number = noomiRpcRequestBuffer.readUInt16BE(index);
    index += MessageConstant.SERVICE_NAME_SIZE_FIELD_LENGTH;

    // 解析methodName长度
    const methodNameSize: number = noomiRpcRequestBuffer.readUInt16BE(index);
    index += MessageConstant.METHOD_NAME_SIZE_FIELD_LENGTH;

    // 从buffer中封装请求
    const noomiRpcRequest: NoomiRpcRequest = new NoomiRpcRequest();
    noomiRpcRequest.setRequestId(requestId);
    noomiRpcRequest.setRequestType(requestType);
    noomiRpcRequest.setSerializeType(serializeType);
    noomiRpcRequest.setCompressType(compressType);

    let payloadBuffer: Uint8Array = noomiRpcRequestBuffer.subarray(index, fullLength);
    if (payloadBuffer !== null && payloadBuffer.length !== 0) {
      // 解压缩
      const compressor: Compressor = CompressorFactory.getCompressor(compressType).impl;
      payloadBuffer = await compressor.decompress(payloadBuffer);

      // 反序列化
      const serializer: Serializer = SerializerFactory.getSerializer(serializeType).impl;
      // const result: RequestPayload = <RequestPayload>(
      //   await SerializerFactory.payloadDeserialize(
      //     serializer,
      //     payloadBuffer,
      //     "server",
      //     serviceNameSize,
      //     methodNameSize,
      //     requestPayload
      //   )
      // );
      // 截取serviceName buffer
      const serviceNameBuffer = payloadBuffer.subarray(0, serviceNameSize);
      // 截取methodName buffer
      const methodNameBuffer = payloadBuffer.subarray(
        serviceNameSize,
        serviceNameSize + methodNameSize
      );
      // 截取argumentsList buffer
      const resultBuffer = payloadBuffer.subarray(serviceNameSize + methodNameSize);
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
        "server",
        serviceName,
        methodName,
        0
      );
      const result = await serializer.deserialize(resultBuffer, description);
      const argumentsList = <unknown[]>(
        InterfaceUtil.executeFunction(serializer.transformValue, result, description, "service")
      );
      const requestPayload: RequestPayload = new RequestPayload();
      requestPayload.setServiceName(serviceName);
      requestPayload.setMethodName(methodName);
      requestPayload.setArgumentsList(argumentsList);
      Logger.debug(`请求id为${requestId}的请求反序列化成功。`);
      noomiRpcRequest.setRequestPayload(requestPayload);
    }
    Logger.debug(`解析id为${requestId}的请求成功。`);
    return noomiRpcRequest;
  }
}
