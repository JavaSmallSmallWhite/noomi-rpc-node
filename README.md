## noomi-rpc框架node.js版本
一款基于fury序列化的跨语言轻量rpc框架。

## 说明
**无论使用哪一种方式，都需要先安装注册中心。可以是zookeeper，可以是nacos，目前框架只继承了这两种。**

**默认已经安装好node.js(版本16以上)，typescript等**

## 使用(以zookeeper为例)
1. 安装zookeeper注册中心，zookeeper官网下载地址：[https://dlcdn.apache.org/zookeeper/](https://dlcdn.apache.org/zookeeper/)

### 针对服务端 ###
1. 创建一个空项目，cd进入该项目并执行npm i noomi-rpc-node安装，以下均在该项目中操作。   
2. 新建config目，然后在该目录下新建rpc.json文件。内容如下：
```json5
// rpc.json
{
  "port": 8091, // 启动端口号
  "appName": "NoomiRpcApplication", // 应用名称
  "servicePrefix": "com.nodejs.Test", // 服务前缀
  "starterPath": ["/dist/examples/provider/**/*.js"], // 项目启动目录
  "log4js": { // 日志配置，具体参照npm log4js
    "configuration": {
      "appenders": {
        "stdout": { "type": "stdout", "layout": {
          "type": "pattern",
          "pattern": "%[[%d] [%p] [%c] - %]%m%n"
        }}
      },
      "categories": {
        "default": {
          "appenders": ["stdout"],
          "level": "info"
        }
      }
    },
    use: "stdout" // 使用的appender名称
  },
  "registry": { // 默认zookeeper
    "type": "zookeeper", // zookeeper连接配置，具体参考npm zookeeper的连接配置
    "connectionConfig": { // zookeeper连接配置
      "connectString": "127.0.0.1:2181", // 连接地址
      "options": {
        "sessionTimeout": 30000,
        "spinDelay": 1000,
        "retries": 0
      },
    },
    "serviceConfig": {},

    //    "type": "nacos",
    //    "connectionConfig": { // nacos连接配置，具体参考npm nacos的连接配置，配置中的logger不用管，noomi-rpc自动传console，nacos也只能传console
    //      "serverList": "127.0.0.1:8848", // 连接地址
    //      "namespace": "public", // 命名空间
    //      "username": "nacos",
    //      "password": "nacos",
    //      "endpoint": null,
    //      "vipSrvRefInterMillis": 30000,
    //      "ssl": false
    //    },
    //    "serviceConfig": { // nacos服务配置，具体参考npm nacos
    //      "healthy": true,
    //      "enabled": true,
    //      "weight": 1,
    //      "ephemeral": true,
    //      "clusterName": "DEFAULT",
    //      "groupName": "DEFAULT_GROUP"
    //    }
  },
  "loadBalancerType": "RoundRobinLoadBalancer", // 负载均衡器类型，目前包含ConsistentHashLoadBalancer、MinimumResponseTimeLoadBalancer、RoundRobinLoadBalancer三种
  "serializerType": "fury", // 序列化类型，目前包含json和fury
  "compressorType": "brotli", // 压缩类型，目前包含brotli、deflate、deflateRaw、gzip四种
  "idGenerator": { // id发号器，生成分布式唯一id
    "dataCenterId": "2", // 数据中心编号
    "machineId": "4" // 机器号
  },
  "circuitBreaker": "SeniorCircuitBreaker", // 熔断器类型，包含SimpleCircuitBreaker简单熔断器和SeniorCircuitBreaker高级熔断器
  "rateLimiter": "TokenBuketRateLimiter"// 限流器类型
}



```
3. 新建provider目录，在provider目录下新建rpc目录，在rpc目录下新建HelloNoomiRpc.ts文件。内容如下：
```typescript
// HelloNoomiRpc.ts
/**
 * 接口定义
 */
export class HelloNoomiRpc {

    /**
     * 通用接口，server和client都需要依赖
     * @param msg 具体的消息
     * @return 返回的结果
     */
    sayHi(msg: string): Promise<string> {
        return Promise.resolve(null);
    }

    /**
     * 通用接口，server和client都需要依赖
     * @param msg 具体的消息
     * @return 返回的结果
     */
    sayHello(msg: string): Promise<string>{
        return Promise.resolve(null);
    }
}

```

4. 在provider目录下新建impl目录，在impl目录中新建HelloNoomiRpcImpl.ts文件。内容如下：
```typescript
// HelloNoomiRpcImpl.ts
/**
 * 实现接口
 */
export class HelloNoomiRpcImpl extends HelloNoomiRpc {
    async sayHi(msg: string): Promise<string> {
        return msg;
    }

    async sayHello(msg: string): Promise<string> {
        return msg;
    }
}
```
5. 在provider目录下新建ProviderApplication.ts文件。内容如下：
```typescript
// ProviderApplication.ts
import {HelloNoomiRpc} from "./api/HelloNoomiRpc";
import {HelloNoomiRpcImpl} from "./impl/HelloNoomiRpcImpl";
import {NoomiRpcStarter, ServiceConfig, NoomiRpcStarter} from "noomi-rpc-node";


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
```
### 针对客户端 ###
1. npm i noomi-rpc-node安装。并创建一个空项目，以下均在该项目中操作。
2. 新建config目，然后在该目录下新建rpc.json文件。内容如下：
```json5
// rpc.json
{
  "port": 8091, // 启动端口号
  "appName": "NoomiRpcApplication", // 应用名称
  "servicePrefix": "com.nodejs.Test", // 服务前缀
  "starterPath": ["/dist/examples/consumer/**/*.js"], // 项目启动目录
  "log4js": { // 日志配置，具体参照npm log4js
    "configuration": {
      "appenders": {
        "stdout": { "type": "stdout", "layout": {
          "type": "pattern",
          "pattern": "%[[%d] [%p] [%c] - %]%m%n"
        }}
      },
      "categories": {
        "default": {
          "appenders": ["stdout"],
          "level": "info"
        }
      }
    },
    use: "stdout" // 使用的appender名称
  },
  "registry": { // 默认zookeeper
    "type": "zookeeper", // zookeeper连接配置，具体参考npm zookeeper的连接配置
    "connectionConfig": { // zookeeper连接配置
      "connectString": "127.0.0.1:2181", // 连接地址
      "options": {
        "sessionTimeout": 30000,
        "spinDelay": 1000,
        "retries": 0
      },
    },
    "serviceConfig": {},

    //    "type": "nacos",
    //    "connectionConfig": { // nacos连接配置，具体参考npm nacos的连接配置，配置中的logger不用管，noomi-rpc自动传console，nacos也只能传console
    //      "serverList": "127.0.0.1:8848", // 连接地址
    //      "namespace": "public", // 命名空间
    //      "username": "nacos",
    //      "password": "nacos",
    //      "endpoint": null,
    //      "vipSrvRefInterMillis": 30000,
    //      "ssl": false
    //    },
    //    "serviceConfig": { // nacos服务配置，具体参考npm nacos
    //      "healthy": true,
    //      "enabled": true,
    //      "weight": 1,
    //      "ephemeral": true,
    //      "clusterName": "DEFAULT",
    //      "groupName": "DEFAULT_GROUP"
    //    }
  },
  "loadBalancerType": "RoundRobinLoadBalancer", // 负载均衡器类型，目前包含ConsistentHashLoadBalancer、MinimumResponseTimeLoadBalancer、RoundRobinLoadBalancer三种
  "serializerType": "fury", // 序列化类型，目前包含json和fury
  "compressorType": "brotli", // 压缩类型，目前包含brotli、deflate、deflateRaw、gzip四种
  "idGenerator": { // id发号器，生成分布式唯一id
    "dataCenterId": "2", // 数据中心编号
    "machineId": "4" // 机器号
  },
  "circuitBreaker": "SeniorCircuitBreaker", // 熔断器类型，包含SimpleCircuitBreaker简单熔断器和SeniorCircuitBreaker高级熔断器
  "rateLimiter": "TokenBuketRateLimiter"// 限流器类型
}



```
3. 新建consumer目录，在consumer目录下新建rpc目录，在rpc目录下新建HelloNoomiRpc.ts文件。内容如下：
```typescript
// HelloNoomiRpc.ts
/**
 * 接口定义
 */
export class HelloNoomiRpc {

    /**
     * 通用接口，server和client都需要依赖
     * @param msg 具体的消息
     * @return 返回的结果
     */
    sayHi(msg: string): Promise<string> {
        return Promise.resolve(null);
    }

    /**
     * 通用接口，server和client都需要依赖
     * @param msg 具体的消息
     * @return 返回的结果
     */
    sayHello(msg: string): Promise<string>{
        return Promise.resolve(null);
    }
}

```
4. 在consumer目录下新建ConsumerApplication.ts文件。内容如下：
```typescript
// ConsumerApplication.ts
import {HelloNoomiRpc} from "./api/HelloNoomiRpc";
import {HelloNoomiRpcDescription} from "./api/description/HelloNoomiRpcDescription";
import {ReferenceConfig, NoomiRpcStarter} from "noomi-rpc-node";

async function main(): Promise<void> {

    // 配置需要调用的接口对象
    const reference: ReferenceConfig<HelloNoomiRpc> = new ReferenceConfig<HelloNoomiRpc>();
    // 创造一个虚拟对象，ts没有为接口或者抽象类创建代理对象的机制，原型上也不会绑定抽象方法，因此必须创建一个虚拟无名的实现类作为代理对象。
    reference.interfaceRef = HelloNoomiRpc;
    // 配置NoomiRpcStarter的信息
    await NoomiRpcStarter.getInstance() // 下面这些自行配置，不配置，使用默认的，默认的参考core目录下的Configuration文件
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
    const result: string = await helloNoomiRpc.sayHi("Hello, noomi-rpc");
    console.log(result)
}
main().then().catch()

```
6. tsc编译该项目并node .\dist\consumer\ConsumerApplication.js运行。输出：Hello, noomi-rpc。

### 融入noomi使用
### 针对服务端 
1. npm i noomi-cli1 -g全局安装noomi脚手架，然后noomi create server创建服务端目录同时npm i noomi-rpc-node。
2. noomi-rpc-node服务端和noomi服务端是两个进程，暂时不能融入，后续将noomi的web和ioc分离后，再融入noomi的ioc部分。现只能做成如下形式：
3. 在config目录中新建rpc.json文件，内容如下：
```json5
// rpc.json
{
  "port": 8091, // 启动端口号
  "appName": "NoomiRpcApplication", // 应用名称
  "servicePrefix": "com.nodejs.Test", // 服务前缀
  "starterPath": ["/dist/examples/provider/**/*.js"], // 项目启动目录
  "log4js": { // 日志配置，具体参照npm log4js
    "configuration": {
      "appenders": {
        "stdout": { "type": "stdout", "layout": {
          "type": "pattern",
          "pattern": "%[[%d] [%p] [%c] - %]%m%n"
        }}
      },
      "categories": {
        "default": {
          "appenders": ["stdout"],
          "level": "info"
        }
      }
    },
    use: "stdout" // 使用的appender名称
  },
  "registry": { // 默认zookeeper
    "type": "zookeeper", // zookeeper连接配置，具体参考npm zookeeper的连接配置
    "connectionConfig": { // zookeeper连接配置
      "connectString": "127.0.0.1:2181", // 连接地址
      "options": {
        "sessionTimeout": 30000,
        "spinDelay": 1000,
        "retries": 0
      },
    },
    "serviceConfig": {},

    //    "type": "nacos",
    //    "connectionConfig": { // nacos连接配置，具体参考npm nacos的连接配置，配置中的logger不用管，noomi-rpc自动传console，nacos也只能传console
    //      "serverList": "127.0.0.1:8848", // 连接地址
    //      "namespace": "public", // 命名空间
    //      "username": "nacos",
    //      "password": "nacos",
    //      "endpoint": null,
    //      "vipSrvRefInterMillis": 30000,
    //      "ssl": false
    //    },
    //    "serviceConfig": { // nacos服务配置，具体参考npm nacos
    //      "healthy": true,
    //      "enabled": true,
    //      "weight": 1,
    //      "ephemeral": true,
    //      "clusterName": "DEFAULT",
    //      "groupName": "DEFAULT_GROUP"
    //    }
  },
  "loadBalancerType": "RoundRobinLoadBalancer", // 负载均衡器类型，目前包含ConsistentHashLoadBalancer、MinimumResponseTimeLoadBalancer、RoundRobinLoadBalancer三种
  "serializerType": "fury", // 序列化类型，目前包含json和fury
  "compressorType": "brotli", // 压缩类型，目前包含brotli、deflate、deflateRaw、gzip四种
  "idGenerator": { // id发号器，生成分布式唯一id
    "dataCenterId": "2", // 数据中心编号
    "machineId": "4" // 机器号
  },
  "circuitBreaker": "SeniorCircuitBreaker", // 熔断器类型，包含SimpleCircuitBreaker简单熔断器和SeniorCircuitBreaker高级熔断器
  "rateLimiter": "TokenBuketRateLimiter"// 限流器类型
}

```
4. 在module目录下新建provider目录，在provider目录下新建api目录，在api目录下新建HelloNoomiRpc.ts文件。内容如下：
```typescript
// HelloNoomiRpc.ts
/**
 * 接口定义
 */
export class HelloNoomiRpc {

    /**
     * 通用接口，server和client都需要依赖
     * @param msg 具体的消息
     * @return 返回的结果
     */
    sayHi(msg: string): Promise<string> {
        return Promise.resolve(null);
    }

    /**
     * 通用接口，server和client都需要依赖
     * @param msg 具体的消息
     * @return 返回的结果
     */
    sayHello(msg: string): Promise<string>{
        return Promise.resolve(null);
    }
}
```
5. 回到module目录的provider目录中，新建impl目录，在impl目录中新建HelloNoomiRpcImpl.ts文件，内容如下：
```typescript
// HelloNoomiRpcImpl.ts
import {HelloNoomiRpc} from "../api/HelloNoomiRpc";
import {NoomiService} from "noomi-rpc-node";

/**
 * 使用NoomiService进行服务注册
 */
@NoomiService<HelloNoomiRpc>({
    interfaceProvider: HelloNoomiRpc,
})
export class HelloNoomiRpcImpl extends HelloNoomiRpc {
    sayHi(msg: string): Promise<string> {
        return Promise.resolve(msg + "sayHi");
    }

    sayHello(msg: string): Promise<string> {
        return Promise.resolve(msg + "sayHello");
    }
}
```
6. 在项目根目录中新建provider.ts文件，内容如下：
```typescript
import {NoomiRpcStarter} from "noomi-rpc-node";

// 启动noomi服务端
NoomiRpcStarter.getInstance().start();
```
8. tsc项目，node ./dist/provider.js即可。

### 针对客户端
1. npm i noomi-cli1 -g全局安装noomi脚手架，然后noomi create client创建服务端目录同时npm i noomi-rpc-node。 
2. 在config目录中新建rpc.json文件，内容如下：
```json5
// rpc.json
{
  "port": 8091, // 启动端口号
  "appName": "NoomiRpcApplication", // 应用名称
  "servicePrefix": "com.nodejs.Test", // 服务前缀
  "starterPath": ["/dist/examples/consumer/**/*.js"], // 项目启动目录
  "log4js": { // 日志配置，具体参照npm log4js
    "configuration": {
      "appenders": {
        "stdout": { "type": "stdout", "layout": {
          "type": "pattern",
          "pattern": "%[[%d] [%p] [%c] - %]%m%n"
        }}
      },
      "categories": {
        "default": {
          "appenders": ["stdout"],
          "level": "info"
        }
      }
    },
    use: "stdout" // 使用的appender名称
  },
  "registry": { // 默认zookeeper
    "type": "zookeeper", // zookeeper连接配置，具体参考npm zookeeper的连接配置
    "connectionConfig": { // zookeeper连接配置
      "connectString": "127.0.0.1:2181", // 连接地址
      "options": {
        "sessionTimeout": 30000,
        "spinDelay": 1000,
        "retries": 0
      },
    },
    "serviceConfig": {},

    //    "type": "nacos",
    //    "connectionConfig": { // nacos连接配置，具体参考npm nacos的连接配置，配置中的logger不用管，noomi-rpc自动传console，nacos也只能传console
    //      "serverList": "127.0.0.1:8848", // 连接地址
    //      "namespace": "public", // 命名空间
    //      "username": "nacos",
    //      "password": "nacos",
    //      "endpoint": null,
    //      "vipSrvRefInterMillis": 30000,
    //      "ssl": false
    //    },
    //    "serviceConfig": { // nacos服务配置，具体参考npm nacos
    //      "healthy": true,
    //      "enabled": true,
    //      "weight": 1,
    //      "ephemeral": true,
    //      "clusterName": "DEFAULT",
    //      "groupName": "DEFAULT_GROUP"
    //    }
  },
  "loadBalancerType": "RoundRobinLoadBalancer", // 负载均衡器类型，目前包含ConsistentHashLoadBalancer、MinimumResponseTimeLoadBalancer、RoundRobinLoadBalancer三种
  "serializerType": "fury", // 序列化类型，目前包含json和fury
  "compressorType": "brotli", // 压缩类型，目前包含brotli、deflate、deflateRaw、gzip四种
  "idGenerator": { // id发号器，生成分布式唯一id
    "dataCenterId": "2", // 数据中心编号
    "machineId": "4" // 机器号
  },
  "circuitBreaker": "SeniorCircuitBreaker", // 熔断器类型，包含SimpleCircuitBreaker简单熔断器和SeniorCircuitBreaker高级熔断器
  "rateLimiter": "TokenBuketRateLimiter"// 限流器类型
}

```
3. 在module目录下的src目录下新建api目录，在api目录下新建HelloNoomiRpc.ts文件。内容如下：
```typescript
// HelloNoomiRpc.ts
/**
 * 接口定义
 */
export class HelloNoomiRpc {

    /**
     * 通用接口，server和client都需要依赖
     * @param msg 具体的消息
     * @return 返回的结果
     */
    sayHi(msg: string): Promise<string> {
        return Promise.resolve(null);
    }

    /**
     * 通用接口，server和client都需要依赖
     * @param msg 具体的消息
     * @return 返回的结果
     */
    sayHello(msg: string): Promise<string>{
        return Promise.resolve(null);
    }
}
```
4. 修改router目录下的hello.route.ts文件，内容如下：
```typescript
import {Router, Route, Inject} from "noomi";
import {HelloService} from '../service/hello.service';
import {HelloServiceImpl} from "../service/serviceImpl/hello.serviceImpl";

/**
 * 路由层
 */
@Router()
export class HelloRoute {

    //依赖注入
    @Inject(HelloServiceImpl)
    private helloService:HelloService;

    //路由
    @Route('/hello')
    async sayHello(): Promise<{result: string}> {
        return {result: await this.helloService.sayHi()};
    }
}
```
5. 修改service目录下的hello.service.ts文件，内容如下：
```typescript
/**
 * 业务层
 */
export interface HelloService {

    sayHello(): string;

    sayHi(): Promise<string>;
}
```
6. 修改/serviceImpl目录下的hello.serviceImpl.ts文件，内容如下：
```typescript
import {Inject, Instance} from "noomi";
import {HelloService} from "../hello.service";
import {HelloDaoImpl} from "../../dao/daoImpl/hello.daoImpl";
import {HelloNoomiRpc} from "../../api/HelloNoomiRpc";
import {NoomiReference} from "noomi-rpc-node";

/**
 * 业务层实现类
 */
@Instance()
export class HelloServiceImpl implements HelloService{

    @Inject(HelloDaoImpl)
    private helloDao: HelloDao

    @NoomiReference({
        interfaceProvider: HelloNoomiRpc,
    })
    private helloNoomiRpc: HelloNoomiRpc

    public sayHello(): string {
        return "Hello Service! " + this.helloDao.sayHello();
    }

    public async sayHi(): Promise<string> {
        return await this.helloNoomiRpc.sayHi("hello,");
    }
}
```
7. tsc项目，node ./dist/app.js即可。
8. 打开浏览器，输入地址http://localhost:3000/hello，输出{"result":"hello,sayHi"}即可。

### 其他
1. 自定义序列化方式。
```typescript
import {Serializer} from "../core/serialize/Serializer";
import {RequestPayload} from "../core/message/RequestPayload";
import {ResponsePayload} from "../core/message/ResponsePayload";
import {CustomSerializer} from "../core/common/decorators/CustomSerializer";

@CustomSerializer({
    serializerId: 10, // 序列化id 1-5号禁止使用，为框架保留号
    isUse: true, // isUse设置为true则表示使用该序列化
    serializerName: "MySerializer" // 序列化器名称 （可选）
})
export class MySerializer implements Serializer {
    deserialize(buffer: Uint8Array, serializeDescription?: unknown): RequestPayload | ResponsePayload | string {
        return undefined;
    }

    serialize(body: RequestPayload | ResponsePayload | string, serializeDescription?: unknown): Uint8Array {
        return undefined;
    }
}
```
2. 自定义压缩方式。
```typescript
import {Compressor} from "../core/compress/Compressor";
import {CustomCompressor} from "../core/common/decorators/CustomCompressor";

@CustomCompressor({
    compressorId: 10, // 压缩器id 1-5号禁止使用，为框架保留号
    isUse: true, // isUse设置为true则表示使用该压缩器
    compressorName: "MyCompressor" // 压缩器器名称 （可选）
})
export class MyCompressor implements Compressor {
    compress(requestPayloadBuffer: Uint8Array): Promise<Uint8Array> {
        return Promise.resolve(undefined);
    }

    decompress(requestPayloadBuffer: Uint8Array): Promise<Uint8Array> {
        return Promise.resolve(undefined);
    }
}
```
3. 自定义负载均衡方式。
```typescript
import {AbstractLoadBalancer} from "../core/loadbalance/AbstractLoadBalancer";
import {Selector} from "../core/loadbalance/Selector";
import {CustomLoadBalancer} from "../core/common/decorators/CustomLoadBalancer";

@CustomLoadBalancer({
    loadBalancerId: 10, // 负载均衡器id 1-5号禁止使用，为框架保留号
    isUse: true, // isUse设置为true则表示使用该负载均衡器
    loadBalancerName: "MyCompressor" // 负载均衡器名称 （可选）
})
export class MyLoadBalancer extends AbstractLoadBalancer {
    protected getSelector(serviceList: Array<string>): Selector {
        return new this.mySelector();
    }

    private mySelector = class MySelector implements Selector {
        getNext(): string {
            return "";
        }
    }
}
```
4. 自定义注册中心。
```typescript
import {AbstractRegistry} from "../core/registry/AbstractRegistry";
import {ServiceConfig} from "../core/ServiceConfig";
import {CustomRegistry} from "../core/common/decorators/CustomRegistry";

@CustomRegistry({
    registryName: "MyRegistry", // 注册中心名称 
    registryConnectConfig: {connect: "127.0.0.1:3000", username: "zhang san", password: "123456", options: {}}, // 连接配置
    isUse: true, // 是否立刻使用
    serviceConfiguration: {timeout: 3000} // 服务配置
})
export class MyRegistry extends AbstractRegistry {
    lookup(serviceName: string): Promise<Array<string>> {
        return Promise.resolve(undefined);
    }

    register(serviceConfig: ServiceConfig<Object>): void {
    }
}
```

5. 自定义限流器
```typescript
@CustomRateLimiter({
    rateLimiterArguments: ["参数一", "参数二"], // 自定义限流器需要的参数，按照构造器参数顺序填写，比如速率、容量等
    rateLimiterName: "MyRateLimiter", // 限流器名称
    isUse: true // 是否使用自定义的
})
class MyRateLimiter implements RateLimiter {

    public constructor(rate: number, capacity: number) {

    }

    allowRequest(): boolean {
        return false;
    }

}
```
6. 自定义熔断器
```typescript
@CustomCircuitBreaker({
    circuitBreakerArguments: ["参数一", "参数二"], // 自定义熔断器需要的参数，按照构造器参数顺序填写，比如最大的错误请求数、最大的异常阈值等
    circuitBreakerName: "MyCircuitBreaker", // 限流器名称
    isUse: true // 是否使用自定义的
})
class MyCircuitBreaker implements CircuitBreaker {

    public constructor(maxErrorRequest: number, maxErrorRate: number) {

    }

    isBreak(): boolean {
        return false;
    }

    recordErrorRequest(): void {
    }

    recordRequest(): void {
    }

    reset(): void {
    }
}
```
### 针对跨语言
**针对跨语言，目前noomi-rpc-java正在开发中，敬请期待....其他语言敬请不期待了。**
