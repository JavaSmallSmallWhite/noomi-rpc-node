import {MessageConstant} from "../../message/MessageConstant";
import {PacketError} from "../../common/error/PacketError";
import {NoomiRpcRequest} from "../../message/NoomiRpcRequest";
import {RequestPayload} from "../../message/RequestPayload";
import {Logger} from "../../common/logger/Logger";
import {Serializer} from "../../serialize/Serializer";
import {SerializerFactory} from "../../serialize/SerializerFactory";
import {Compressor} from "../../compress/Compressor";
import {CompressorFactory} from "../../compress/CompressorFactory";
import {BufferToMessageDecoderHandler} from "../BufferToMessageDecoderHandler";
import {Socket} from "net";
import {TypeDescription} from "@furyjs/fury";

/**
 * 请求解码器
 */
export class NoomiRpcRequestDecoder extends BufferToMessageDecoderHandler<NoomiRpcRequest> {

    /**
     * 偏移量指针
     * @private
     */
    private index: number = 0;

    /**
     * 解析请求
     * @param socketChannel socket通道
     * @param noomiRpcRequestBuffer 请求报文流
     */
    public async decode(socketChannel: Socket, noomiRpcRequestBuffer: Buffer): Promise<NoomiRpcRequest> {
        Logger.debug("开始解析请求报文。")

        // 解析魔术指
        const magic: string = noomiRpcRequestBuffer.subarray(this.index, this.index + MessageConstant.MAGIC_FIELD_LENGTH).toString();
        this.index += MessageConstant.MAGIC_FIELD_LENGTH;
        if (magic !== MessageConstant.MAGIC.toString()) {
            throw new PacketError("获得的请求不合法。");
        }

        // 解析版本
        const version: number = noomiRpcRequestBuffer.readUInt8(this.index);
        this.index += MessageConstant.VERSION_FIELD_LENGTH;
        if (version > MessageConstant.VERSION) {
            throw new PacketError("获得的请求版本不被支持。");
        }

        // 解析头部长度
        const headLength: number = noomiRpcRequestBuffer.readUInt16BE(this.index);
        this.index += MessageConstant.HEADER_FIELD_LENGTH

        // 解析总长度
        const fullLength: number = noomiRpcRequestBuffer.readUint32BE(this.index);
        this.index += MessageConstant.FULL_FIELD_LENGTH;

        // 解析请求类型
        const requestType: number = noomiRpcRequestBuffer.readUInt8(this.index);
        this.index += MessageConstant.REQUEST_TYPE_FIELD_LENGTH;

        // 解析序列化类型
        const serializeType: number = noomiRpcRequestBuffer.readUInt8(this.index);
        this.index += MessageConstant.SERIALIZER_TYPE_FIELD_LENGTH

        // 解析压缩类型
        const compressType: number = noomiRpcRequestBuffer.readUInt8(this.index);
        this.index += MessageConstant.COMPRESSOR_TYPE_FIELD_LENGTH;

        // 解析请求id
        const requestId: bigint = noomiRpcRequestBuffer.readBigInt64BE(this.index);
        this.index += MessageConstant.REQUEST_ID_FIELD_LENGTH;

        // 解析其他
        const other: bigint = noomiRpcRequestBuffer.readBigInt64BE(this.index);
        this.index = headLength;

        // 从buffer中封装请求
        const noomiRpcRequest: NoomiRpcRequest = new NoomiRpcRequest();
        noomiRpcRequest.setRequestId(requestId);
        noomiRpcRequest.setRequestType(requestType);
        noomiRpcRequest.setSerializeType(serializeType);
        noomiRpcRequest.setCompressType(compressType);
        noomiRpcRequest.setOther(other);

        let requestPayload: RequestPayload = new RequestPayload();

        let payloadBuffer: Uint8Array = noomiRpcRequestBuffer.subarray(this.index, fullLength);
        this.index = 0;
        if (payloadBuffer !== null && payloadBuffer.length !== 0) {
            // 解压缩
            const compressor: Compressor = CompressorFactory.getCompressor(compressType).impl;
            payloadBuffer = await compressor.decompress(payloadBuffer);

            // 反序列化
            const serializer: Serializer = SerializerFactory.getSerializer(serializeType).impl;
            const serializeDescription: TypeDescription = SerializerFactory.getServiceSerializeDescription(other, "argumentsDescription");
            const result: RequestPayload = <RequestPayload>serializer.deserialize(payloadBuffer, serializeDescription);
            Object.assign(requestPayload, result);
            Logger.debug(`请求id为${requestId}的请求反序列化成功。`);
            noomiRpcRequest.setRequestPayload(requestPayload);
        }
        Logger.debug(`解析id为${requestId}的请求成功。`);
        return noomiRpcRequest;
    }
}
