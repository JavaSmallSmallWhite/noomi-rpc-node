import {NoomiReference} from "../../../core/common/decorators/NoomiReference";
import {HelloNoomiRpcDescription} from "../api/description/HelloNoomiRpcDescription";
import {HelloNoomiRpc} from "../api/HelloNoomiRpc";
import {Registry} from "../../../core/common/decorators/Registry";

@Registry({
    registryName: "aaa",
    registryConnectConfig: {},
    isUse: true,
    serviceConfiguration: {}
})
export class Service {

    @NoomiReference<HelloNoomiRpc, HelloNoomiRpcDescription>({
        interfaceProvider: new HelloNoomiRpc(),
        interfaceDescription: new HelloNoomiRpcDescription()
    })
    private helloNoomiRpc: HelloNoomiRpc;

    public async sayHi(): Promise<void> {
        const res = await this.helloNoomiRpc.sayHi("aaa");
        console.log(res)
    }
}
