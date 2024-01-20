import {Serializer} from "../Serializer";
import {Logger} from "../../common/logger/Logger";
import {SerializeError} from "../../common/error/SerializeError";
import {RequestPayload} from "../../message/RequestPayload";
import {ResponsePayload} from "../../message/ResponsePayload";

/**
 * Json序列化器
 */
export class JsonSerializer implements Serializer {

    /**
     * Json序列化
     * @param body 序列化内容
     */
    public serialize(body: RequestPayload | ResponsePayload): Uint8Array {
        if (!body) {
            Logger.debug("序列化的请求体为空。")
            return null;
        }
        try {
            const bodyJson: string = JSON.stringify(body);
            const bodyBuffer: Buffer = Buffer.from(bodyJson);
            Logger.debug(`requestPayload请求体已经完成了序列化操作，序列化后的字节数位${bodyBuffer.length}`)
            return bodyBuffer;
        } catch (error) {
            Logger.error("requestPayload请求体的json序列化操作失败。");
            throw new SerializeError(error.message);
        }
    }

    /**
     * Json反序列化
     * @param buffer 待反序列化的Buffer
     */
    public deserialize(buffer: Uint8Array): RequestPayload | ResponsePayload {
        if (!buffer) {
            Logger.debug("反序列化时传入的Buffer流为空，或者反序列化后指定的目标类为空");
            return null;
        }

        try {
            const bodyString: string = buffer.toString();
            const body: RequestPayload | ResponsePayload = JSON.parse(bodyString);

            Logger.debug("反序列化操作完成。");
            return body;
        } catch (error) {
            Logger.error(`${buffer}流的json反序列化操作失败。`);
            throw new SerializeError(error.message);
        }
    }
}
