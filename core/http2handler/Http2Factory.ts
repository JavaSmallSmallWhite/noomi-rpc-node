import { Http2ServerRequest, Http2ServerResponse } from "../common/utils/TypesUtil";

export class Http2Factory {
  public static async handleHttp2Request(
    request: Http2ServerRequest,
    response: Http2ServerResponse
  ): Promise<void> {}
}
