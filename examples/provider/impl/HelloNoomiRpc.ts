import { HelloNoomiRpcApi } from "../api/HelloNoomiRpcApi";

/**
 * 接口实现
 */
export class HelloNoomiRpc implements HelloNoomiRpcApi {
  async sayHi(msg: string): Promise<string> {
    return msg;
  }

  async sayHello(msg: string): Promise<string> {
    return msg;
  }
}
