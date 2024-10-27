/**
 * 压缩器
 */
export interface Compressor {
  /**
   * 对序列化后buffer流进行压缩
   * @param requestPayloadBuffer 待压缩的buffer流
   * @return 压缩后的buffer流
   */
  compress(requestPayloadBuffer: Uint8Array): Promise<Uint8Array>;

  /**
   * 对传输过来的buffer流进行解压缩
   * @param requestPayloadBuffer 待解压缩的buffer流
   * @return 解压缩后的buffer流
   */
  decompress(requestPayloadBuffer: Uint8Array): Promise<Uint8Array>;
}
