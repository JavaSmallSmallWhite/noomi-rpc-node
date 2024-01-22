import {HelloNoomiRpc} from "../api/HelloNoomiRpc";
import {RegistryConfig} from "../../core/discovery/RegistryConfig";
import {HelloNoomiRpcDescription} from "../api/description/HelloNoomiRpcDescription";
import {Starter} from "../../core";
import {ReferenceConfig} from "../../core/ReferenceConfig";
import {RoundRobinLoadBalancer} from "../../core/loadbalance/impl/RoundRobinLoadBalancer";

async function main(): Promise<void> {

    // 配置需要调用的接口对象
    const reference: ReferenceConfig<HelloNoomiRpc, HelloNoomiRpcDescription> = new ReferenceConfig<HelloNoomiRpc, HelloNoomiRpcDescription>();
    // 创造一个虚拟对象，ts没有为接口或者抽象类创建代理对象的机制，原型上也不会绑定抽象方法，因此必须创建一个虚拟无名的实现类作为代理对象。
    // 后续用proto序列化时，采用proto作为公共约定。
    reference.interfaceRef = new class extends HelloNoomiRpc {
        sayHello(msg: string): Promise<string> {
            return Promise.resolve("");
        }
        sayHi(msg: string): Promise<string> {
            return Promise.resolve("");
        }
    }();
    // 设置接口描述
    reference.interfaceDescription = new HelloNoomiRpcDescription();
    // 配置NoomiRpcStarter的信息
    await Starter.getInstance()
        .application("first-noomi-rpc-consumer-application")
        .servicePrefix("com.nodejs.Test")
        .registry(new RegistryConfig("zookeeper"))
        .loadBalancer("RoundRobinLoadBalancer")
        .serializer("fury")
        .compressor("gzip")
        .reference(reference);
    // 获取HelloNoomiRpc的代理对象，所有的rpc操作都通过代理对象去进行
    const helloNoomiRpc: HelloNoomiRpc = reference.get();
    // 调用方法
    setTimeout(async function () {
        for (let i = 0; i < 100; i++) {
            // await new Promise((resolve, reject) => {
            //     setTimeout(function () {
            //         resolve(null);
            //     }, 1000);
            // })
            const result1: string = await helloNoomiRpc.sayHi("hello noomi" + i);
            const result2: string = await helloNoomiRpc.sayHi("hello noomi" + i);
            console.log(result1);
            console.log(result2);
        }
    }, 3000)
}
main().then().catch()


