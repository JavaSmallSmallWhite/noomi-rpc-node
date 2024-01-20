import {Compressor} from "../Compressor";
import {Logger} from "../../common/logger/Logger";
import {gzip, unzip} from "zlib";
import {CompressError} from "../../common/error/CompressError";

/**
 * gzip压缩器
 */
export class GzipCompressor implements Compressor {

    /**
     * 对序列化后buffer流进行压缩
     * @param requestPayloadBuffer 待压缩的buffer流
     * @return 压缩后的buffer流
     */
    public async compress(requestPayloadBuffer: Uint8Array): Promise<Uint8Array> {
        const compressResult: Error | Uint8Array = await new Promise((resolve, reject): void => {
            gzip(requestPayloadBuffer, function (error: (Error | null), buffer: Uint8Array): void {
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

    /**
     * 对传输过来的buffer流进行解压缩
     * @param requestPayloadBuffer 待解压缩的buffer流
     * @return 解压缩后的buffer流
     */
    public async decompress(requestPayloadBuffer: Uint8Array): Promise<Uint8Array> {
        const decompressResult: Error | Uint8Array = await new Promise((resolve, reject): void => {
            unzip(requestPayloadBuffer, function(error: Error, buffer: Uint8Array): void  {
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
