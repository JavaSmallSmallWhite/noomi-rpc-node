import { MessageToBufferEncoderHandler } from "../MessageToBufferEncoderHandler";
import { NoomiRpcResponse } from "../../message/NoomiRpcResponse";
import { MessageConstant } from "../../message/MessageConstant";
import { SerializerFactory } from "../../serialize/SerializerFactory";
import { Serializer } from "../../serialize/Serializer";
import { Compressor } from "../../compress/Compressor";
import { CompressorFactory } from "../../compress/CompressorFactory";
import { Logger } from "../../common/logger/Logger";
import { BufferUtil } from "../../common/utils/BufferUtil";
import { ResponsePayload } from "../../message/ResponsePayload";
import { Socket } from "../../common/utils/TypesUtil";
import { InterfaceUtil } from "../../common/utils/InterfaceUtil";
import { TipManager } from "../../common/error/TipManager";

/**
 * 响应编码编码器
 */
export class NoomiRpcResponseEncoder extends MessageToBufferEncoderHandler<NoomiRpcResponse> {
  /**
   * 响应编码
   * @param _socketChannel socket通道
   * @param noomiRpcResponse 响应
   */
  protected async encode(
    _socketChannel: Socket,
    noomiRpcResponse: NoomiRpcResponse
  ): Promise<Buffer> {
    // 偏移量指针
    let index: number = 0;

    // 响应头报文流
    const headerBuffer: Buffer = Buffer.alloc(MessageConstant.HEADER_LENGTH);

    // 写入魔术指---> 4个字节
    MessageConstant.MAGIC.copy(headerBuffer, index);
    index += MessageConstant.MAGIC_FIELD_LENGTH;

    // 写入版本号---> 1个字节
    headerBuffer.writeUInt8(MessageConstant.VERSION, index);
    index += MessageConstant.VERSION_FIELD_LENGTH;

    // 写入头部长度---> 2个字节
    headerBuffer.writeUInt16BE(MessageConstant.HEADER_LENGTH, index);
    index += MessageConstant.HEADER_FIELD_LENGTH;

    // body长度不知道，总长度就不知道，先不管---> 4个字节
    index += MessageConstant.FULL_FIELD_LENGTH;

    // 写入响应类型---> 1个字节
    headerBuffer.writeUInt8(noomiRpcResponse.getResponseType(), index);
    index += MessageConstant.RESPONSE_TYPE_FIELD_LENGTH;

    // 写入序列化类型---> 1个字节
    headerBuffer.writeUInt8(noomiRpcResponse.getSerializeType(), index);
    index += MessageConstant.SERIALIZER_TYPE_FIELD_LENGTH;

    // 写入压缩类型---> 1个字节
    headerBuffer.writeUInt8(noomiRpcResponse.getCompressType(), index);
    index += MessageConstant.COMPRESSOR_TYPE_FIELD_LENGTH;

    // 写入请求id---> 8个字节
    headerBuffer.writeBigUInt64BE(noomiRpcResponse.getRequestId(), index);
    index += MessageConstant.REQUEST_ID_FIELD_LENGTH;

    // 响应体的封装
    const responseBody: ResponsePayload = noomiRpcResponse.getResponseBody();
    let responseBodyBuffer: Uint8Array;

    if (responseBody) {
      // 序列化响应体
      const serializer: Serializer = SerializerFactory.getSerializer(
        noomiRpcResponse.getSerializeType()
      ).impl;
      // responseBodyBuffer = await SerializerFactory.payloadSerialize(
      //   serializer,
      //   responseBody,
      //   "server.js",
      //   headerBuffer,
      //   index
      // );
      const serviceName = responseBody.getServiceName();
      const methodName = responseBody.getMethodName();
      const serviceNameDescription = InterfaceUtil.executeFunction(
        serializer.getServiceNameDescription
      );
      const serviceNameBuffer = await serializer.serialize(serviceName, serviceNameDescription);
      const methodNameDescription = InterfaceUtil.executeFunction(
        serializer.getMethodNameDescription
      );
      const methodNameBuffer = await serializer.serialize(methodName, methodNameDescription);
      const description = InterfaceUtil.executeFunction(
        serializer.getDataDescription,
        "server",
        serviceName,
        methodName,
        1
      );
      const returnValue = responseBody.getReturnValue();
      const dataBuffer = await serializer.serialize(returnValue, description);
      // 写入响应头 serviceNameBuffer的大小
      headerBuffer.writeUInt16BE(serviceNameBuffer.length, index);
      index += MessageConstant.SERVICE_NAME_SIZE_FIELD_LENGTH;
      // 写入响应头 methodNameBuffer的大小
      headerBuffer.writeUInt16BE(methodNameBuffer.length, index);
      responseBodyBuffer = Buffer.concat([serviceNameBuffer, methodNameBuffer, dataBuffer]);
      // 压缩响应体
      // const compressor: Compressor = CompressorFactory.getCompressor(
      //   noomiRpcResponse.getCompressType()
      // ).impl;
      // responseBodyBuffer = await compressor.compress(responseBodyBuffer);
    }

    let responseBuffer: Buffer;
    if (responseBodyBuffer) {
      // 写入响应体---> responseBodyBuffer.length个字节
      responseBuffer = Buffer.concat([headerBuffer, responseBodyBuffer]);
      // 将偏移量指针移到总长度位置
      index =
        MessageConstant.MAGIC_FIELD_LENGTH +
        MessageConstant.VERSION_FIELD_LENGTH +
        MessageConstant.HEADER_FIELD_LENGTH;
      // 写入总长度---> 4个字节
      responseBuffer.writeUint32BE(
        MessageConstant.HEADER_LENGTH + responseBodyBuffer.length,
        index
      );
    } else {
      responseBuffer = headerBuffer;
      // 将偏移量指针移到总长度位置
      index =
        MessageConstant.MAGIC_FIELD_LENGTH +
        MessageConstant.VERSION_FIELD_LENGTH +
        MessageConstant.HEADER_FIELD_LENGTH;
      // 写入总长度---> 4个字节
      responseBuffer.writeUint32BE(MessageConstant.HEADER_LENGTH, index);
    }
    if (Logger.getLogger().isDebugEnabled()) {
      Logger.debug(TipManager.getTip("0146", BufferUtil.formatBuffer(responseBuffer)));
    }
    return responseBuffer;
  }
}
