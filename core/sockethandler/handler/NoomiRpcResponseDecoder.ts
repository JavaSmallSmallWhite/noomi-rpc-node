import {BufferToMessageDecoderHandler} from "../BufferToMessageDecoderHandler";
import {NoomiRpcResponse} from "../../message/NoomiRpcResponse";
import {Socket} from "net";
import {Logger} from "../../common/logger/Logger";
import {MessageConstant} from "../../message/MessageConstant";
import {PacketError} from "../../common/error/PacketError";
import {Compressor} from "../../compress/Compressor";
import {CompressorFactory} from "../../compress/CompressorFactory";
import {Serializer} from "../../serialize/Serializer";
import {SerializerFactory} from "../../serialize/SerializerFactory";
import {ResponsePayload} from "../../message/ResponsePayload";
import {TypeDescription} from "@furyjs/fury";
import {NoomiRpcStarter} from "../../NoomiRpcStarter";

/**
 * 响应解码器
 */
export class NoomiRpcResponseDecoder extends BufferToMessageDecoderHandler<NoomiRpcResponse>{

    /**
     * 偏移量指针
     * @private
     */
    private index: number = 0;

    /**
     * 响应解码
     * @param socketChannel socket通道
     * @param responseBuffer 响应流
     */
    public async decode(socketChannel: Socket, responseBuffer: Buffer): Promise<NoomiRpcResponse> {
        Logger.debug("开始解析响应报文。");

        // 解析魔术指
        const magic: string = responseBuffer.subarray(this.index, this.index + MessageConstant.MAGIC_FIELD_LENGTH).toString();
        this.index += MessageConstant.MAGIC_FIELD_LENGTH;
        if (magic !== MessageConstant.MAGIC.toString()) {
            throw new PacketError("获得的请求不合法。");
        }

        // 解析版本
        const version: number = responseBuffer.readUInt8(this.index);
        this.index += MessageConstant.VERSION_FIELD_LENGTH;
        if (version > MessageConstant.VERSION) {
            throw new PacketError("获得的请求版本不被支持。");
        }

        // 解析头部长度
        const headLength: number = responseBuffer.readUInt16BE(this.index);
        this.index += MessageConstant.HEADER_FIELD_LENGTH;

        // 解析总长度
        const fullLength: number = responseBuffer.readUint32BE(this.index);
        this.index += MessageConstant.FULL_FIELD_LENGTH;

        // 解析响应类型
        const responseType: number = responseBuffer.readUInt8(this.index);
        this.index += MessageConstant.REQUEST_TYPE_FIELD_LENGTH;

        // 解析序列化类型
        const serializeType: number = responseBuffer.readUInt8(this.index);
        this.index += MessageConstant.SERIALIZER_TYPE_FIELD_LENGTH

        // 解析压缩类型
        const compressType: number = responseBuffer.readUInt8(this.index);
        this.index += MessageConstant.COMPRESSOR_TYPE_FIELD_LENGTH;

        // 解析请求id
        const requestId: bigint = responseBuffer.readBigInt64BE(this.index);
        this.index += MessageConstant.REQUEST_ID_FIELD_LENGTH;

        // 解析description id
        const descriptionId: bigint = responseBuffer.readBigInt64BE(this.index);
        this.index += MessageConstant.DESCRIPTION_ID_FIELD_LENGTH;

        // 解析description size
        const descriptionSize: bigint = responseBuffer.readBigInt64BE(this.index);
        this.index = headLength;

        const noomiRpcResponse: NoomiRpcResponse = new NoomiRpcResponse();
        noomiRpcResponse.setResponseType(responseType);
        noomiRpcResponse.setCompressType(compressType);
        noomiRpcResponse.setSerializeType(serializeType);
        noomiRpcResponse.setRequestId(requestId);
        noomiRpcResponse.setDescriptionId(descriptionId);

        const responsePayload: ResponsePayload = new ResponsePayload();
        let bodyBuffer: Uint8Array = responseBuffer.subarray(this.index, fullLength);
        this.index = 0;
        if (bodyBuffer !== null && bodyBuffer.length !== 0) {
            // 解压缩
            const compressor: Compressor = CompressorFactory.getCompressor(compressType).impl;
            bodyBuffer = await compressor.decompress(bodyBuffer);

            // 反序列化
            // 获取序列化器
            const serializer: Serializer = SerializerFactory.getSerializer(serializeType).impl;
            let result: ResponsePayload;
            if (NoomiRpcStarter.getInstance().getConfiguration().serializerType === "fury") {
                // 截取description buffer
                const descriptionBuffer: Uint8Array = bodyBuffer.subarray(0, Number(descriptionSize));
                // 反序列化description buffer
                const serializeDescriptionString: string = <string>serializer.deserialize(descriptionBuffer);
                // 生成description
                const serializeDescription: TypeDescription = JSON.parse(serializeDescriptionString);
                // 截取响应体的buffer
                bodyBuffer = bodyBuffer.subarray(Number(descriptionSize));
                // 反序列化响应体buffer
                result = <ResponsePayload>serializer.deserialize(bodyBuffer, serializeDescription);
            } else {
                // 反序列化响应体buffer
                result = <ResponsePayload>serializer.deserialize(bodyBuffer);
            }
            Object.assign(responsePayload, result);
            noomiRpcResponse.setResponseBody(responsePayload);
            Logger.debug(`请求id为${requestId}的响应反序列化成功。`);
        }
        return noomiRpcResponse;
    }
}
