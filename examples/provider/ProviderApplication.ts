import {ServiceConfig} from "../../core/ServiceConfig";
import {HelloNoomiRpc} from "./api/HelloNoomiRpc";
import {HelloNoomiRpcImpl} from "./impl/HelloNoomiRpcImpl";
import {NoomiRpcStarter} from "../../core/NoomiRpcStarter";

async function main(): Promise<void> {

    // 获取服务配置
    const service: ServiceConfig<HelloNoomiRpc> = new ServiceConfig<HelloNoomiRpc>();
    // 设置接口
    service.interfaceProvider = HelloNoomiRpc;
    // 设置具体实现
    service.ref = HelloNoomiRpcImpl;
    // 配置NoomiRpcStarter的信息
    const starter: NoomiRpcStarter = NoomiRpcStarter.getInstance()
    // 下面这些自行配置，不配置，使用默认的，默认的参考core目录下的Configuration文件
        // .application("first-noomi-rpc-provider-application")
        // .servicePrefix("com.nodejs.Test")
        // .registry(new RegistryConfig( "zookeeper"))
        // .serializer("fury")
        // .compressor("gzip")

    // 发布服务
    await starter.publish(service)
    // 启动starter监听请求
    starter.start();
}

main().then()

// @NoomiService({
//     interfaceProvider: new HelloNoomiRpc()
// })
// class Class extends HelloNoomiRpc{
//
//     async sayHi(msg: string): Promise<string> {
//         return msg;
//     }
//
//     async sayHello(msg: string): Promise<string> {
//         return msg;
//     }
// }
