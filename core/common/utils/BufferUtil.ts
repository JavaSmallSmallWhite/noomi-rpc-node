/**
 * Buffer流工具类
 */
export class BufferUtil {
  /**
   * 格式化流的打印
   */
  public static formatBuffer(buffer: Buffer): string {
    let bufferString: string = "";
    bufferString +=
      " WRITE: " +
      buffer.length +
      "B\n" +
      "         +-------------------------------------------------+\n" +
      "         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |\n" +
      "+--------+-------------------------------------------------+------------------+\n";
    for (let i = 0; i < buffer.length; i += 16) {
      const slice: Buffer = buffer.slice(i, i + 16);
      const hexLine: string = Array.from(slice)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(" ");

      const asciiLine: string = Array.from(slice)
        .map((byte) => (byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : "."))
        .join("");

      bufferString += `|${i.toString(16).padStart(8, "0")}| ${hexLine.padEnd(47)} | ${asciiLine.padEnd(16, " ")} |\n`;
    }

    bufferString += `+--------+-------------------------------------------------+------------------+\n`;
    return bufferString;
  }
}
