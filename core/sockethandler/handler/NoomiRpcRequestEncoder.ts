import { NoomiRpcRequest } from "../../message/NoomiRpcRequest";
import { RequestPayload } from "../../message/RequestPayload";
import { MessageConstant } from "../../message/MessageConstant";
import { Logger } from "../../common/logger/Logger";
import { Serializer } from "../../serialize/Serializer";
import { SerializerFactory } from "../../serialize/SerializerFactory";
import { Compressor } from "../../compress/Compressor";
import { CompressorFactory } from "../../compress/CompressorFactory";
import { BufferUtil } from "../../common/utils/BufferUtil";
import { MessageToBufferEncoderHandler } from "../MessageToBufferEncoderHandler";
import { Socket } from "../../common/utils/TypesUtil";
import { InterfaceUtil } from "../../common/utils/InterfaceUtil";
import { TipManager } from "../../common/error/TipManager";

/**
 * 请求编码器
 */
export class NoomiRpcRequestEncoder extends MessageToBufferEncoderHandler<NoomiRpcRequest> {
  /**
   * 请求编码
   * @param _socketChannel socket通道
   * @param noomiRpcRequest noomiRpc请求
   */
  protected async encode(
    _socketChannel: Socket,
    noomiRpcRequest: NoomiRpcRequest
  ): Promise<Buffer> {
    // 偏移量指针
    let index: number = 0;

    // 请求头报文流
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

    // 写入请求类型---> 1个字节
    headerBuffer.writeUInt8(noomiRpcRequest.getRequestType(), index);
    index += MessageConstant.REQUEST_TYPE_FIELD_LENGTH;

    // 写入序列化类型---> 1个字节
    headerBuffer.writeUInt8(noomiRpcRequest.getSerializeType(), index);
    index += MessageConstant.SERIALIZER_TYPE_FIELD_LENGTH;

    // 写入压缩类型---> 1个字节
    headerBuffer.writeUInt8(noomiRpcRequest.getCompressType(), index);
    index += MessageConstant.COMPRESSOR_TYPE_FIELD_LENGTH;

    // 写入请求id---> 8个字节
    headerBuffer.writeBigUInt64BE(noomiRpcRequest.getRequestId(), index);
    index += MessageConstant.REQUEST_ID_FIELD_LENGTH;

    // 请求体的封装
    const requestPayload: RequestPayload = noomiRpcRequest.getRequestPayload();
    let requestPayloadBuffer: Uint8Array;

    // 序列化请求体
    if (requestPayload) {
      // 1. 获取序列化器
      const serializer: Serializer = SerializerFactory.getSerializer(
        noomiRpcRequest.getSerializeType()
      ).impl;

      // 2. 序列化请求体
      // requestPayloadBuffer = await SerializerFactory.payloadSerialize(
      //   serializer,
      //   requestPayload,
      //   "client",
      //   headerBuffer,
      //   index
      // );
      const serviceName = requestPayload.getServiceName();
      const methodName = requestPayload.getMethodName();
      const argumentsList = requestPayload.getArgumentsList();
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
        "client",
        serviceName,
        methodName,
        0
      );
      const transformValue = InterfaceUtil.executeFunction(
        serializer.transformValue,
        argumentsList,
        description,
        "client"
      );
      const dataBuffer = await serializer.serialize(transformValue, description);
      // 写入请求头 serviceNameBuffer的大小
      headerBuffer.writeUInt16BE(serviceNameBuffer.length, index);
      index += MessageConstant.SERVICE_NAME_SIZE_FIELD_LENGTH;
      // 写入请求头 methodNameBuffer的大小
      headerBuffer.writeUInt16BE(methodNameBuffer.length, index);
      requestPayloadBuffer = Buffer.concat([serviceNameBuffer, methodNameBuffer, dataBuffer]);
      // 压缩请求体
      const compressor: Compressor = CompressorFactory.getCompressor(
        noomiRpcRequest.getCompressType()
      ).impl;
      requestPayloadBuffer = await compressor.compress(requestPayloadBuffer);
    }
    let requestBuffer: Buffer;
    if (requestPayloadBuffer) {
      // 写入请求体---> requestPayloadBuffer.length个字节
      requestBuffer = Buffer.concat([headerBuffer, requestPayloadBuffer]);
      // 将偏移量指针移到总长度位置
      index =
        MessageConstant.MAGIC_FIELD_LENGTH +
        MessageConstant.VERSION_FIELD_LENGTH +
        MessageConstant.HEADER_FIELD_LENGTH;
      // 写入总长度---> 4个字节
      requestBuffer.writeUint32BE(
        MessageConstant.HEADER_LENGTH + requestPayloadBuffer.length,
        index
      );
    } else {
      requestBuffer = Buffer.concat([headerBuffer]);
      // 将偏移量指针移到总长度位置
      index =
        MessageConstant.MAGIC_FIELD_LENGTH +
        MessageConstant.VERSION_FIELD_LENGTH +
        MessageConstant.HEADER_FIELD_LENGTH;
      // 写入总长度---> 4个字节
      requestBuffer.writeUint32BE(MessageConstant.HEADER_LENGTH, index);
    }
    if (Logger.getLogger().isDebugEnabled()) {
      Logger.debug(TipManager.getTip("0142", BufferUtil.formatBuffer(requestBuffer)));
    }
    return requestBuffer;
  }
}
