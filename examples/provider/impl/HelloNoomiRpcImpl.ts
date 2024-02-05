import {NoomiService} from "../../../core/common/decorators/NoomiService";
import {HelloNoomiRpcDescription} from "../api/description/HelloNoomiRpcDescription";

@NoomiService<HelloNoomiRpc, HelloNoomiRpcDescription>({
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
export class HelloNoomiRpcImpl implements HelloNoomiRpc {
    sayHi(msg: string): Promise<string> {
        return Promise.resolve(msg);
    }

    sayHello(msg: string): Promise<string> {
        return Promise.resolve(msg);
    }
}
