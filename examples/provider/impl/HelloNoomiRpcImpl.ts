export class HelloNoomiRpcImpl implements HelloNoomiRpc {
    sayHi(msg: string): Promise<string> {
        return Promise.resolve(msg);
    }

    sayHello(msg: string): Promise<string> {
        return Promise.resolve(msg);
    }
}
