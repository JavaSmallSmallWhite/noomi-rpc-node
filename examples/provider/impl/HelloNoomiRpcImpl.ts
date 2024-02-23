import {HelloNoomiRpc} from "../api/HelloNoomiRpc";

/**
 * 接口实现
 */
export class HelloNoomiRpcImpl extends HelloNoomiRpc {
    async sayHi(msg: string, msg1?: number): Promise<string | number> {
        if (msg1) {
            return msg1;
        }
        return msg;
    }

    async sayHello(msg: string): Promise<string> {
        return msg;
    }
}
