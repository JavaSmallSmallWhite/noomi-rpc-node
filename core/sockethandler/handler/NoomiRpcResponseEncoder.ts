import {MessageToBufferEncoderHandler} from "../MessageToBufferEncoderHandler";
import {NoomiRpcResponse} from "../../message/NoomiRpcResponse";
import {Socket} from "net";
import {MessageConstant} from "../../message/MessageConstant";
import {SerializerFactory} from "../../serialize/SerializerFactory";
import {Serializer} from "../../serialize/Serializer";
import {Compressor} from "../../compress/Compressor";
import {CompressorFactory} from "../../compress/CompressorFactory";
import {Logger} from "../../common/logger/Logger";
import {BufferUtil} from "../../common/utils/BufferUtil";
import {TypeDescription} from "@furyjs/fury";
import {ResponsePayload} from "../../message/ResponsePayload";
import {GlobalCache} from "../../cache/GlobalCache";
import {NoomiRpcStarter} from "../../NoomiRpcStarter";

/**
 * 响应编码编码器
 */
export class NoomiRpcResponseEncoder extends MessageToBufferEncoderHandler<NoomiRpcResponse> {

    /**
     * 偏移量指针
     * @private
     */
    private index: number = 0;

    /**
     * 响应编码
     * @param socketChannel socket通道
     * @param noomiRpcResponse 响应
     */
    public async encode(socketChannel: Socket, noomiRpcResponse: NoomiRpcResponse): Promise<Buffer> {
        // 响应头报文流
        const headerBuffer: Buffer = Buffer.alloc(MessageConstant.HEADER_LENGTH);

        // 写入魔术指---> 4个字节
        MessageConstant.MAGIC.copy(headerBuffer, this.index);
        this.index += MessageConstant.MAGIC_FIELD_LENGTH;

        // 写入版本号---> 1个字节
        headerBuffer.writeUInt8(MessageConstant.VERSION, this.index);
        this.index += MessageConstant.VERSION_FIELD_LENGTH;

        // 写入头部长度---> 2个字节
        headerBuffer.writeUInt16BE(MessageConstant.HEADER_LENGTH, this.index);
        this.index += MessageConstant.HEADER_FIELD_LENGTH;

        // body长度不知道，总长度就不知道，先不管---> 4个字节
        this.index += MessageConstant.FULL_FIELD_LENGTH;

        // 写入响应类型---> 1个字节
        headerBuffer.writeUInt8(noomiRpcResponse.getResponseType(), this.index);
        this.index += MessageConstant.RESPONSE_TYPE_FIELD_LENGTH;

        // 写入序列化类型---> 1个字节
        headerBuffer.writeUInt8(noomiRpcResponse.getSerializeType(), this.index);
        this.index += MessageConstant.SERIALIZER_TYPE_FIELD_LENGTH;

        // 写入压缩类型---> 1个字节
        headerBuffer.writeUInt8(noomiRpcResponse.getCompressType(), this.index);
        this.index += MessageConstant.COMPRESSOR_TYPE_FIELD_LENGTH;

        // 写入请求id---> 8个字节
        headerBuffer.writeBigUInt64BE(noomiRpcResponse.getRequestId(), this.index);
        this.index += MessageConstant.REQUEST_ID_FIELD_LENGTH;

        // 写入description id---> 8个字节
        headerBuffer.writeBigUInt64BE(noomiRpcResponse.getDescriptionId(), this.index);
        this.index += MessageConstant.DESCRIPTION_ID_FIELD_LENGTH;

        // 响应体的封装
        const responseBody: ResponsePayload = noomiRpcResponse.getResponseBody();
        let responseBodyBuffer: Uint8Array;

        if (responseBody) {
            // 序列化响应体
            // 获取序列化器
            const serializer: Serializer = SerializerFactory.getSerializer(noomiRpcResponse.getSerializeType()).impl;
            if (NoomiRpcStarter.getInstance().getConfiguration().serializerType === "fury") {
                // 获取responseBody的description
                const serializeDescription: TypeDescription = SerializerFactory.getDataDescription(responseBody, String(noomiRpcResponse.getDescriptionId()))
                // fury序列化responseBody的description
                const serializeDescriptionString: string = JSON.stringify(serializeDescription);
                const descriptionBuffer: Uint8Array = serializer.serialize(serializeDescriptionString);
                // 写入description size占用的字节---> 8个字节
                headerBuffer.writeBigUInt64BE(BigInt(descriptionBuffer.length), this.index);
                this.index += MessageConstant.DESCRIPTION_SIZE_FIELD_LENGTH;
                // 序列化响应体
                responseBodyBuffer = Buffer.concat([descriptionBuffer, serializer.serialize(responseBody, serializeDescription)]);
            } else {
                responseBodyBuffer = serializer.serialize(responseBody);
            }
            // 压缩响应体
            const compressor: Compressor = CompressorFactory.getCompressor(noomiRpcResponse.getCompressType()).impl;
            responseBodyBuffer = await compressor.compress(responseBodyBuffer);
        }

        let responseBuffer: Buffer;
        if (responseBodyBuffer) {
            // 写入响应体---> responseBodyBuffer.length个字节
            responseBuffer = Buffer.concat([headerBuffer, responseBodyBuffer]);
            // 将偏移量指针移到总长度位置
            this.index = MessageConstant.MAGIC_FIELD_LENGTH + MessageConstant.VERSION_FIELD_LENGTH + MessageConstant.HEADER_FIELD_LENGTH;
            // 写入总长度---> 4个字节
            responseBuffer.writeUint32BE(MessageConstant.HEADER_LENGTH + responseBodyBuffer.length, this.index);
            // 写完后，将指针归0
            this.index = 0;
        } else {
            responseBuffer = headerBuffer;
            // 将偏移量指针移到总长度位置
            this.index = MessageConstant.MAGIC_FIELD_LENGTH + MessageConstant.VERSION_FIELD_LENGTH + MessageConstant.HEADER_FIELD_LENGTH;
            // 写入总长度---> 4个字节
            responseBuffer.writeUint32BE(MessageConstant.HEADER_LENGTH, this.index);
            this.index = 0;
        }

        Logger.debug(`请求报文封装成功，请求报文如下：${BufferUtil.formatBuffer(responseBuffer)}`);
        return responseBuffer;
    }

}
