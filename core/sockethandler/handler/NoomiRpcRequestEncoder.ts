import {NoomiRpcRequest} from "../../message/NoomiRpcRequest";
import {RequestPayload} from "../../message/RequestPayload";
import {MessageConstant} from "../../message/MessageConstant";
import {Logger} from "../../common/logger/Logger";
import {Description, Serializer} from "../../serialize/Serializer";
import {SerializerFactory} from "../../serialize/SerializerFactory";
import {Compressor} from "../../compress/Compressor";
import {CompressorFactory} from "../../compress/CompressorFactory";
import {BufferUtil} from "../../common/utils/BufferUtil";
import {MessageToBufferEncoderHandler} from "../MessageToBufferEncoderHandler";
import {Socket} from "net";
import {TypeDescription} from "@furyjs/fury";
import {NoomiRpcStarter} from "../../NoomiRpcStarter";
import {GlobalCache} from "../../cache/GlobalCache";

/**
 * 请求编码器
 */
export class NoomiRpcRequestEncoder extends MessageToBufferEncoderHandler<NoomiRpcRequest>{

    /**
     * 偏移量指针
     * @private
     */
    private index: number = 0;

    /**
     * 请求编码
     * @param socketChannel socket通道
     * @param noomiRpcRequest noomiRpc请求
     */
    public async encode(socketChannel: Socket, noomiRpcRequest: NoomiRpcRequest): Promise<Buffer> {

        // 请求头报文流
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

        // 写入请求类型---> 1个字节
        headerBuffer.writeUInt8(noomiRpcRequest.getRequestType(), this.index);
        this.index += MessageConstant.REQUEST_TYPE_FIELD_LENGTH;

        // 写入序列化类型---> 1个字节
        headerBuffer.writeUInt8(noomiRpcRequest.getSerializeType(), this.index);
        this.index += MessageConstant.SERIALIZER_TYPE_FIELD_LENGTH;

        // 写入压缩类型---> 1个字节
        headerBuffer.writeUInt8(noomiRpcRequest.getCompressType(), this.index);
        this.index += MessageConstant.COMPRESSOR_TYPE_FIELD_LENGTH;

        // 写入请求id---> 8个字节
        headerBuffer.writeBigUInt64BE(noomiRpcRequest.getRequestId(), this.index);
        this.index += MessageConstant.REQUEST_ID_FIELD_LENGTH;

        // 写入description id---> 8个字节
        headerBuffer.writeBigUInt64BE(noomiRpcRequest.getDescriptionId(), this.index);
        this.index += MessageConstant.DESCRIPTION_ID_FIELD_LENGTH;

        // 请求体的封装
        const requestPayload: RequestPayload = noomiRpcRequest.getRequestPayload();
        let requestPayloadBuffer: Uint8Array;
        if (requestPayload) {
            // 序列化请求体
            // 获取序列化器
            const serializer: Serializer = SerializerFactory.getSerializer(noomiRpcRequest.getSerializeType()).impl;
            if (NoomiRpcStarter.getInstance().getConfiguration().serializerType === "fury") {
                let flag: boolean = false;
                let serializeDescriptionString: string;
                let serializeDescription: TypeDescription;
                const descriptionMethodKey: string = requestPayload.getServiceName() + "+" + requestPayload.getMethodName() + "+argument";
                for (const descriptionId of GlobalCache.DESCRIPTION_LIST.get(descriptionMethodKey)) {
                    // 获取requestPayload的description
                    serializeDescription = SerializerFactory.getDataDescription(requestPayload, descriptionId);
                    // 生成description字符串
                    serializeDescriptionString = JSON.stringify(serializeDescription);
                    // 判断是否存在
                    const description: Description = GlobalCache.DESCRIPTION_SERIALIZER_LIST.get(descriptionId);
                    if (!description) {
                        const description: Description = {
                            descriptionString: serializeDescriptionString,
                            serializerFunction: null,
                        }
                        GlobalCache.DESCRIPTION_SERIALIZER_LIST.set(descriptionId, description);
                        flag = true;
                        break;
                    }
                    if (serializeDescriptionString === description.descriptionString) {
                        flag = true;
                        break;
                    }
                }
                // 集合中不存在则添加到description集合中
                if (!flag) {
                    const descriptionId: string = NoomiRpcStarter.getInstance().getConfiguration().idGenerator.getId().toString();
                    serializeDescription = SerializerFactory.getDataDescription(requestPayload, descriptionId);
                    serializeDescriptionString = JSON.stringify(serializeDescription);
                    const description: Description = {
                        descriptionString: serializeDescriptionString,
                        serializerFunction: null,
                    }
                    GlobalCache.DESCRIPTION_LIST.get(descriptionMethodKey).push(descriptionId);
                    GlobalCache.DESCRIPTION_SERIALIZER_LIST.set(descriptionId, description);
                }
                // fury序列化requestPayload的description
                const descriptionBuffer: Uint8Array = serializer.serialize(serializeDescriptionString);
                // 重新写入description id
                this.index -= MessageConstant.DESCRIPTION_ID_FIELD_LENGTH;
                headerBuffer.writeBigUInt64BE(BigInt(serializeDescription["options"]["tag"]), this.index);
                this.index += MessageConstant.DESCRIPTION_ID_FIELD_LENGTH;
                // 写入description size占用的字节---> 8个字节
                headerBuffer.writeBigUInt64BE(BigInt(descriptionBuffer.length), this.index);
                this.index += MessageConstant.DESCRIPTION_SIZE_FIELD_LENGTH;
                // 序列化请求体
                requestPayloadBuffer = Buffer.concat([descriptionBuffer, serializer.serialize(requestPayload, serializeDescription)]);
            } else {
                requestPayloadBuffer = serializer.serialize(requestPayload);
            }
            // 压缩请求体
            const compressor: Compressor = CompressorFactory.getCompressor(noomiRpcRequest.getCompressType()).impl;
            requestPayloadBuffer = await compressor.compress(requestPayloadBuffer);
        }
        let requestBuffer: Buffer;
        if (requestPayloadBuffer) {
            // 写入请求体---> requestPayloadBuffer.length个字节
            requestBuffer = Buffer.concat([headerBuffer, requestPayloadBuffer]);
            // 将偏移量指针移到总长度位置
            this.index = MessageConstant.MAGIC_FIELD_LENGTH + MessageConstant.VERSION_FIELD_LENGTH + MessageConstant.HEADER_FIELD_LENGTH;
            // 写入总长度---> 4个字节
            requestBuffer.writeUint32BE(MessageConstant.HEADER_LENGTH + requestPayloadBuffer.length, this.index);
            // 写完后，将指针归0
            this.index = 0;
        } else {
            requestBuffer = Buffer.concat([headerBuffer]);
            // 将偏移量指针移到总长度位置
            this.index = MessageConstant.MAGIC_FIELD_LENGTH + MessageConstant.VERSION_FIELD_LENGTH + MessageConstant.HEADER_FIELD_LENGTH;
            // 写入总长度---> 4个字节
            requestBuffer.writeUint32BE(MessageConstant.HEADER_LENGTH, this.index);
            // 写完后，将指针归0
            this.index = 0;
        }
        Logger.debug(`请求报文封装成功，请求报文如下：${BufferUtil.formatBuffer(requestBuffer)}`);
        return requestBuffer;
    }
}
