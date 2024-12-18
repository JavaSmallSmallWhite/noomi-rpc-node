import { Compressor } from "../Compressor";
import { Logger } from "../../common/logger/Logger";
import { Application } from "../../common/utils/ApplicationUtil";
import { NoomiRpcError } from "../../common/error/NoomiRpcError";
import { TipManager } from "../../common/error/TipManager";

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
      Application.zlib.gzip(
        requestPayloadBuffer,
        function (error: Error | null, buffer: Uint8Array): void {
          if (error) {
            reject(error);
          }
          Logger.debug(TipManager.getTip("0125", requestPayloadBuffer.length, buffer.length));
          resolve(buffer);
        }
      );
    });
    if (compressResult instanceof Error) {
      throw new NoomiRpcError("0500", compressResult.message);
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
      Application.zlib.unzip(
        requestPayloadBuffer,
        function (error: Error, buffer: Uint8Array): void {
          if (error) {
            reject(error);
          }
          Logger.debug(TipManager.getTip("0126", requestPayloadBuffer.length, buffer.length));
          resolve(buffer);
        }
      );
    });
    if (decompressResult instanceof Error) {
      throw new NoomiRpcError("0501", decompressResult.message);
    }
    return decompressResult;
  }
}
