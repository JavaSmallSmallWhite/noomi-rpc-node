import {NoomiService} from "../../../core/common/decorators/NoomiService";
import {HelloNoomiRpcDescription} from "../api/description/HelloNoomiRpcDescription";
import {HelloNoomiRpc} from "../api/HelloNoomiRpc";

@NoomiService<HelloNoomiRpc, HelloNoomiRpcDescription>({
    interfaceProvider: new HelloNoomiRpc(),
    interfaceDescription: new HelloNoomiRpcDescription(),
    serviceConfiguration: {
        healthy: true,
        enabled: true,
        weight: 1,
        ephemeral: true,
        clusterName: "DEFAULT",
        groupName: "DEFAULT_GROUP"
    }
})
export class HelloNoomiRpcImpl extends HelloNoomiRpc {
    sayHi(msg: string): Promise<string> {
        return Promise.resolve(msg);
    }

    sayHello(msg: string): Promise<string> {
        return Promise.resolve(msg);
    }
}
