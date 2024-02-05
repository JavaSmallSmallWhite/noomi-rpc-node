## noomi-rpc框架
一款基于fury序列化的node.js轻量rpc框架。

## 使用
**代码参考examples中的例子**
1. 安装zookeeper注册中心，zookeeper官网下载地址：[https://dlcdn.apache.org/zookeeper/](https://dlcdn.apache.org/zookeeper/)
2. 配置config目录中的rpc.json文件。
3. 编写接口：
```typescript
/**
 * 接口定义
 */
interface HelloNoomiRpc {

    /**
     * 通用接口，server和client都需要依赖
     * @param msg 具体的消息
     * @return 返回的结果
     */
    sayHi(msg: string): Promise<string>

    /**
     * 通用接口，server和client都需要依赖
     * @param msg 具体的消息
     * @return 返回的结果
     */
    sayHello(msg: string): Promise<string>
}
```
4. 实现接口：
```typescript
export class HelloNoomiRpcImpl implements HelloNoomiRpc {
    sayHi(msg: string): Promise<string> {
        return Promise.resolve(msg);
    }

    sayHello(msg: string): Promise<string> {
        return Promise.resolve(msg);
    }
}
```

5. 编写接口描述代码：
```typescript
import {Type} from "@furyjs/fury";
import {Description} from "../../../core/ServiceConfig";

/**
 * HelloNoomiRpc的接口描述
 */
export class HelloNoomiRpcDescription {

    /**
     * sayHi方法的描述
     * 方法描述必须以的函数名必须以Description结尾
     */
    public sayHiDescription(): Description {
        return {
            // 参数描述，用Type.array()报告每个参数类型
            argumentsDescription: Type.array(Type.string()),
            // 返回值描述
            returnValueDescription: Type.string()
        };
    }

    /**
     * sayHi方法的描述
     * 方法描述必须以的函数名必须以Description结尾
     */
    public sayHelloDescription(): Description {
        return {
            argumentsDescription: Type.array(Type.string()),
            returnValueDescription: Type.string()
        };
    }
}
```
6. 编写服务端代码：
```typescript
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
```
7. 编写客户端代码：
```typescript
import {HelloNoomiRpcDescription} from "../api/description/HelloNoomiRpcDescription";
import {Starter} from "../../core";
import {ReferenceConfig} from "../../core/ReferenceConfig";

async function main(): Promise<void> {

    // 配置需要调用的接口对象
    const reference: ReferenceConfig<HelloNoomiRpc, HelloNoomiRpcDescription> = new ReferenceConfig<HelloNoomiRpc, HelloNoomiRpcDescription>();
    // 创造一个虚拟对象，ts没有为接口或者抽象类创建代理对象的机制，原型上也不会绑定抽象方法，因此必须创建一个虚拟无名的实现类作为代理对象。
    // 后续用proto序列化时，采用proto作为公共约定。
    reference.interfaceRef = new class HelloNoomiRpc implements HelloNoomiRpc {
        sayHello(msg: string): Promise<string> {
            return Promise.resolve("");
        }
        sayHi(msg: string): Promise<string> {
            return Promise.resolve("");
        }
    };
    // 设置接口描述
    reference.interfaceDescription = new HelloNoomiRpcDescription();
    // 配置NoomiRpcStarter的信息
    await Starter.getInstance()
        // .application("first-noomi-rpc-consumer-application")
        // .servicePrefix("com.nodejs.Test")
        // .registry(new RegistryConfig("zookeeper"))
        // .loadBalancer("RoundRobinLoadBalancer")
        // .serializer("fury")
        // .compressor("gzip")
        .reference(reference);

    // 获取HelloNoomiRpc的代理对象，所有的rpc操作都通过代理对象去进行
    const helloNoomiRpc: HelloNoomiRpc = reference.get();
    // 调用方法
    const result1: string = await helloNoomiRpc.sayHi("hello noomi1" );
    const result2: string = await helloNoomiRpc.sayHello("hello noomi2");
    console.log(result1);
    console.log(result2);
}
main().then().catch()
```
8. tsc整个项目。
9. 运行服务端代码。
10. 运行客户端代码。输出hello noomi1和hello noomi2。

**注意运行客户端时修改rpc.json文件的startPath。服务端改为："starterPath": ["/dist/examples/provider/**/*.js"] 客户端改为"starterPath": ["/dist/examples/consumer/**/*.js"]**

