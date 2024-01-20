import {HelloNoomiRpc} from "../../api/HelloNoomiRpc";

export class HelloNoomiRpcImpl extends HelloNoomiRpc {
    sayHi(msg: string): Promise<string> {
        return Promise.resolve(msg);
    }

    sayHello(msg: string): Promise<string> {
        return Promise.resolve(msg);
    }
}
