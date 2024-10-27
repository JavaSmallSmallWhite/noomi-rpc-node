import { HelloNoomiRpcApi } from "../api/HelloNoomiRpcApi";

/**
 * 接口实现
 */
export class HelloNoomiRpc implements HelloNoomiRpcApi {
  async sayHi(name: string, age?: number): Promise<{ number: number }> {
    if (name) {
      return { number: 10 };
    }
    return { number: age };
  }

  async sayHello(msg: string): Promise<string> {
    return msg;
  }
}
