import {NoomiReference} from "../../../core/common/decorators/NoomiReference";
import {HelloNoomiRpcDescription} from "../api/description/HelloNoomiRpcDescription";

export class Service {

    @NoomiReference<HelloNoomiRpc, HelloNoomiRpcDescription>({
        interfaceProvider: new class HelloNoomiRpc implements HelloNoomiRpc {
            sayHello(msg: string): Promise<string> {
                return Promise.resolve("");
            }

            sayHi(msg: string): Promise<string> {
                return Promise.resolve("");
            }
        },
        interfaceDescription: new HelloNoomiRpcDescription()
    })
    private helloNoomiRpc: HelloNoomiRpc;

    public async sayHi(): Promise<void> {
        const res = await this.helloNoomiRpc.sayHi("aaa");
        console.log(res)
    }
}
