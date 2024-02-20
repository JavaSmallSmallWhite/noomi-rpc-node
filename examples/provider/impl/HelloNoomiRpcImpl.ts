import {HelloNoomiRpc} from "../api/HelloNoomiRpc";

/**
 * 接口实现
 */
export class HelloNoomiRpcImpl extends HelloNoomiRpc {
    async sayHi(msg: string): Promise<string> {
        return msg;
    }

    async sayHello(msg: string): Promise<string> {
        return msg;
    }
}
