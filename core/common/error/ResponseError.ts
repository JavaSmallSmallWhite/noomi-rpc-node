export class ResponseError extends Error {
  /**
   * 错误码
   * @private
   */
  private code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.message = message;
  }
}
