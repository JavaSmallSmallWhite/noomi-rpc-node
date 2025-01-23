import { HelloNoomiRpcApi, HelloNoomiRpcDescription } from "../api/HelloNoomiRpcApi";
import { NoomiService } from "../../../core/common/decorators/NoomiService";

/**
 * 接口实现
 */
@NoomiService({
  serviceName: "com.nodejs.server.js",
  description: HelloNoomiRpcDescription
})
export class HelloNoomiRpc implements HelloNoomiRpcApi {
  public async sayHi(msg: string): Promise<string> {
    return msg;
  }

  public async sayHello(msg: string): Promise<string> {
    return msg;
  }
}
