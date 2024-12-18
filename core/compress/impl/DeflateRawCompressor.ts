import { Compressor } from "../Compressor";
import { Logger } from "../../common/logger/Logger";
import { Application } from "../../common/utils/ApplicationUtil";
import { NoomiRpcError } from "../../common/error/NoomiRpcError";
import { TipManager } from "../../common/error/TipManager";

/**
 * deflateRaw 压缩器
 */
export class DeflateRawCompressor implements Compressor {
  public async compress(requestPayloadBuffer: Uint8Array): Promise<Uint8Array> {
    const compressResult: Error | Uint8Array = await new Promise((resolve, reject): void => {
      Application.zlib.deflateRaw(
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

  public async decompress(requestPayloadBuffer: Uint8Array): Promise<Uint8Array> {
    const decompressResult: Error | Uint8Array = await new Promise((resolve, reject): void => {
      Application.zlib.inflateRaw(
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
