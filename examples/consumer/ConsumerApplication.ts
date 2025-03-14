import { ReferenceConfig } from "../../core/ReferenceConfig";
import { NoomiRpcStarter } from "../../core/NoomiRpcStarter";
import { HelloNoomiRpcApi, HelloNoomiRpcDescription } from "./api/HelloNoomiRpcApi";
import { InterfaceUtil } from "../../core/common/utils/InterfaceUtil";

import { sample } from "./basic/Object";
async function main(): Promise<void> {
  // 配置需要调用的接口对象
  const reference: ReferenceConfig<HelloNoomiRpcApi> = new ReferenceConfig<HelloNoomiRpcApi>();
  reference.serviceName = "com.nodejs.test.js.HelloNoomiRpc";
  // 创造一个虚拟对象，ts没有为接口或者抽象类创建代理对象的机制，原型上也不会绑定抽象方法，因此必须创建一个虚拟无名的实现类对象作为代理对象。
  reference.interfaceRef = InterfaceUtil.genInterfaceClass(
    "HelloNoomiRpcApi.ts",
    "HelloNoomiRpcApi"
  );
  // reference.protoFile = process.cwd() + "/examples/consumer/proto/hello.proto";
  // reference.protoServiceName = "com.node.test.js.Greeter";

  reference.descriptionClass = HelloNoomiRpcDescription;

  // 配置NoomiRpcStarter的信息
  await NoomiRpcStarter.getInstance() // 下面这些自行配置，不配置，使用默认的，默认的参考core目录下的Configuration文件
    // .application("first-noomi-rpc-consumer-application")
    // .servicePrefix("com.nodejs.Test")
    // .registry(new RegistryConfig("zookeeper"))
    // .loadBalancer("RoundRobinLoadBalancer")
    // .serializer("fury")
    // .compressor("gzip")
    // ...
    .reference(reference);
  // 获取HelloNoomiRpc的代理对象，所有的rpc操作都通过代理对象去进行
  const helloNoomiRpc: HelloNoomiRpcApi = reference.get();
  const requests = [];
  // 调用方法
  for (let i = 0; i < 500; i++) {
    const res = await helloNoomiRpc.sayHi(sample);
    // requests.push(res);
  }
  // Promise.all(requests).then((res) => {
  console.timeEnd("noomi-rpc-node总执行请求响应时间");
  // });
  // const result1= await helloNoomiRpc.sayHello("Hello,RPC1");
  // console.log(result);
  // console.log(result1)
  // }
}
main().then().catch();
