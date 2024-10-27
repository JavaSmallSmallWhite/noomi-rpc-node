import { ServiceConfig } from "../../core/ServiceConfig";
import { NoomiRpcStarter } from "../../core/NoomiRpcStarter";
import { HelloNoomiRpcApi } from "./api/HelloNoomiRpcApi";
import { HelloNoomiRpc } from "./impl/HelloNoomiRpc";
import { HelloNoomiRpcDescription } from "./description/HelloNoomiRpcDescription";

async function main(): Promise<void> {
  // 获取服务配置
  const service: ServiceConfig<HelloNoomiRpcApi> = new ServiceConfig<HelloNoomiRpcApi>();
  // 设置服务名称
  service.serviceName = "com.nodejs.test.HelloNoomiRpc";
  // 设置接口
  service.interfaceProvider = HelloNoomiRpc;
  // 设置description
  service.descriptionClass = HelloNoomiRpcDescription;

  // service.protoFile = process.cwd() + "/examples/provider/proto/hello.proto";
  // service.protoServiceName = "com.node.test.Greeter";
  // 配置NoomiRpcStarter的信息
  const starter: NoomiRpcStarter = NoomiRpcStarter.getInstance();
  // 下面这些自行配置，不配置，使用默认的，默认的参考core目录下的Configuration文件
  // .application("first-noomi-rpc-provider-application")
  // .servicePrefix("com.nodejs.Test")
  // .registry(new RegistryConfig( "zookeeper"))
  // .serializer("fury")
  // .compressor("gzip")
  // ...

  // 发布服务
  await starter.publish(service);
  // 启动starter监听请求
  starter.start();
}

main().then().catch();

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
