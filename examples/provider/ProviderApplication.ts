import {Starter} from "../../core";


function main(): void {

    // // 获取服务配置
    // const service: ServiceConfig<HelloNoomiRpc, HelloNoomiRpcDescription> = new ServiceConfig<HelloNoomiRpc, HelloNoomiRpcDescription>();
    // // 设置接口
    // service.interfaceProvider = new class HelloNoomiRpc implements HelloNoomiRpc {
    //     sayHello(msg: string): Promise<string> {
    //         return Promise.resolve("");
    //     }
    //
    //     sayHi(msg: string): Promise<string> {
    //         return Promise.resolve("");
    //     }
    // };
    // // 设置具体实现
    // service.ref = new HelloNoomiRpcImpl();
    // // 设置接口描述
    // service.interfaceDescription = new HelloNoomiRpcDescription();
    // 配置NoomiRpcStarter的信息
    Starter.getInstance().start()
        // .application("first-noomi-rpc-provider-application")
        // .servicePrefix("com.nodejs.Test")
        // .registry(new RegistryConfig( "zookeeper"))
        // .serializer("fury")
        // .compressor("gzip")

    // 发布服务
    // await starter.publish(service)
    // 启动starter监听请求
}

main()
