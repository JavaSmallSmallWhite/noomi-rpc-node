import {Compressor} from "../Compressor";
import {deflate, inflate} from "zlib";
import {Logger} from "../../common/logger/Logger";
import {CompressError} from "../../common/error/CompressError";

/**
 * deflate 压缩器
 */
export class DeflateCompressor implements Compressor{
    public async compress(requestPayloadBuffer: Uint8Array): Promise<Uint8Array> {
        const compressResult: Error | Uint8Array = await new Promise((resolve, reject): void => {
            deflate(requestPayloadBuffer, function (error: (Error | null), buffer: Uint8Array): void {
                if (error) {
                    reject(error);
                }
                Logger.debug(`对字节数组进行进行了压缩，长度由${requestPayloadBuffer.length}压缩至${buffer.length}。`)
                resolve(buffer);
            });
        });
        if (compressResult instanceof Error) {
            Logger.error("对字节数组进行压缩时发生异常。");
            throw new CompressError(compressResult.message);
        }
        return compressResult;
    }

    public async decompress(requestPayloadBuffer: Uint8Array): Promise<Uint8Array> {
        const decompressResult: Error | Uint8Array = await new Promise((resolve, reject): void => {
            inflate(requestPayloadBuffer, function(error: Error, buffer: Uint8Array): void  {
                if (error) {
                    reject(error);
                }
                Logger.debug(`对字节数组进行进行了解压缩，长度由${requestPayloadBuffer.length}变为${buffer.length}。`);
                resolve(buffer);
            });
        });
        if (decompressResult instanceof Error) {
            Logger.error("对字节数组进行解压缩时发生异常。");
            throw new CompressError(decompressResult.message);
        }
        return decompressResult;
    }

}
