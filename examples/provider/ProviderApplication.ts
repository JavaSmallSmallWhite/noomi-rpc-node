import {ServiceConfig} from "../../core/ServiceConfig";
import {HelloNoomiRpcImpl} from "./impl/HelloNoomiRpcImpl";
import {NoomiRpcStarter} from "../../core/NoomiRpcStarter";
import {HelloNoomiRpcDescription} from "../api/description/HelloNoomiRpcDescription";
import {Starter} from "../../core";


async function main(): Promise<void> {

    // 获取服务配置
    const service: ServiceConfig<HelloNoomiRpc, HelloNoomiRpcDescription> = new ServiceConfig<HelloNoomiRpc, HelloNoomiRpcDescription>();
    // 设置接口
    service.interfaceProvider = new class HelloNoomiRpc implements HelloNoomiRpc {
        sayHello(msg: string): Promise<string> {
            return Promise.resolve("");
        }

        sayHi(msg: string): Promise<string> {
            return Promise.resolve("");
        }
    };
    // 设置具体实现
    service.ref = new HelloNoomiRpcImpl();
    // 设置接口描述
    service.interfaceDescription = new HelloNoomiRpcDescription();
    // 配置NoomiRpcStarter的信息
    const starter: NoomiRpcStarter = Starter.getInstance()
        // .application("first-noomi-rpc-provider-application")
        // .servicePrefix("com.nodejs.Test")
        // .registry(new RegistryConfig( "zookeeper"))
        // .serializer("fury")
        // .compressor("gzip")

    // 发布服务
    await starter.publish(service)
    // 启动starter监听请求
    await starter.start()
}

main().then().catch()
