## noomi-rpc框架node.js版本
一款基于fury序列化的跨语言轻量rpc框架。

**注意：本人很菜，写的很烂。** 

## 说明
**无论使用哪一种方式，都需要先安装注册中心。可以是zookeeper，可以是nacos，目前框架只继承了这两种。**

**默认已经安装好node.js(版本16以上)，typescript等**

## 使用(以zookeeper为例)
1. 安装zookeeper注册中心，zookeeper官网下载地址：[https://dlcdn.apache.org/zookeeper/](https://dlcdn.apache.org/zookeeper/)

### 针对服务端 ###
1. npm i noomi-rpc-node安装。并创建一个空项目，以下均在该项目中操作。   
2. 新建config目，然后在该目录下新建rpc.json文件。内容如下：
```json5
// rpc.json
{
  "port": 8091, // 启动端口号
  "appName": "NoomiRpcApplication", // 应用名称
  "servicePrefix": "com.nodejs.Test", // 服务前缀，需要唯一性，主要针对跨语言开发，比如Java
  "starterPath": ["/dist/provider/**/*.js"], // 项目启动目录
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
          "level": "error"
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
    //    "serviceConfig": {
    //      "healthy": true,
    //      "enabled": true,
    //      "weight": 1,
    //      "ephemeral": true,
    //      "clusterName": "DEFAULT",
    //      "groupName": "DEFAULT_GROUP"
    //    }
  },
  "loadBalancerType": "RoundRobinLoadBalancer", // 负载均衡器类型
  "serializerType": "json", // 序列化类型
  "compressorType": "gzip", // 压缩类型
  "idGenerator": { // id发号器，生成分布式唯一id
    "dataCenterId": "2", // 数据中心编号
    "machineId": "4" // 机器号
  }
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
4. 在api目录下新建description目录，在description目录新建HelloNoomiRpcDescription.ts文件。内容如下：
```typescript
// HelloNoomiRpcDescription.ts
import {Type} from "@furyjs/fury";
import {Description} from "noomi-rpc-node";

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

5. 在provider目录下新建impl目录，在impl目录中新建HelloNoomiRpcImpl.ts文件。内容如下：
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
6. 在provider目录下新建ProviderApplication.ts文件。内容如下：
```typescript
// ProviderApplication.ts
import {HelloNoomiRpc} from "./api/HelloNoomiRpc";
import {HelloNoomiRpcDescription} from "./api/description/HelloNoomiRpcDescription";
import {HelloNoomiRpcImpl} from "./impl/HelloNoomiRpcImpl";
import {NoomiRpcStarter, ServiceConfig, Starter} from "noomi-rpc-node";


async function main(): Promise<void> {

    // 获取服务配置
    const service: ServiceConfig<HelloNoomiRpc, HelloNoomiRpcDescription> = new ServiceConfig<HelloNoomiRpc, HelloNoomiRpcDescription>();
    // 设置接口
    service.interfaceProvider = new HelloNoomiRpc();
    // 设置具体实现
    service.ref = new HelloNoomiRpcImpl();
    // 设置接口描述
    service.interfaceDescription = new HelloNoomiRpcDescription();
    // 配置NoomiRpcStarter的信息
    const starter: NoomiRpcStarter = Starter.getInstance()
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
7. tsc编译该项目并node .\dist\provider\ProviderApplication.js运行。
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
### 针对客户端 ###
1. npm i noomi-rpc-node安装。并创建一个空项目，以下均在该项目中操作。
2. 新建config目，然后在该目录下新建rpc.json文件。内容如下：
```json5
// rpc.json
{
  "port": 8091, // 启动端口号
  "appName": "NoomiRpcApplication", // 应用名称
  "servicePrefix": "com.nodejs.Test", // 服务前缀，需要唯一性，主要针对跨语言开发，比如Java
  "starterPath": ["/dist/consumer/**/*.js"], // 项目启动目录
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
          "level": "error"
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
    //    "serviceConfig": {
    //      "healthy": true,
    //      "enabled": true,
    //      "weight": 1,
    //      "ephemeral": true,
    //      "clusterName": "DEFAULT",
    //      "groupName": "DEFAULT_GROUP"
    //    }
  },
  "loadBalancerType": "RoundRobinLoadBalancer", // 负载均衡器类型
  "serializerType": "json", // 序列化类型
  "compressorType": "gzip", // 压缩类型
  "idGenerator": { // id发号器，生成分布式唯一id
    "dataCenterId": "2", // 数据中心编号
    "machineId": "4" // 机器号
  }
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
4. 在api目录下新建description目录，在description目录新建HelloNoomiRpcDescription.ts文件。内容如下：
```typescript
// HelloNoomiRpcDescription.ts
import {Type} from "@furyjs/fury";
import {Description} from "noomi-rpc-node";

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
5. 在consumer目录下新建ConsumerApplication.ts文件。内容如下：
```typescript
// ConsumerApplication.ts
import {HelloNoomiRpc} from "./api/HelloNoomiRpc";
import {HelloNoomiRpcDescription} from "./api/description/HelloNoomiRpcDescription";
import {ReferenceConfig, Starter} from "noomi-rpc-node";

async function main(): Promise<void> {

    // 配置需要调用的接口对象
    const reference: ReferenceConfig<HelloNoomiRpc, HelloNoomiRpcDescription> = new ReferenceConfig<HelloNoomiRpc, HelloNoomiRpcDescription>();
    // 创造一个虚拟对象，ts没有为接口或者抽象类创建代理对象的机制，原型上也不会绑定抽象方法，因此必须创建一个虚拟无名的实现类作为代理对象。
    reference.interfaceRef = new HelloNoomiRpc();
    // 设置接口描述
    reference.interfaceDescription = new HelloNoomiRpcDescription();
    // 配置NoomiRpcStarter的信息
    await Starter.getInstance() // 下面这些自行配置，不配置，使用默认的，默认的参考core目录下的Configuration文件
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
2. noomi-rpc-node服务端和noomi服务端是两个进程，基本上不能融入，后续会引入inversifyjs来实现ioc等功能，不再融入noomi。现只能做成如下形式：
3. 在config目录中新建rpc.json文件，内容如下：
```json5
// rpc.json
{
  "port": 8090, // 启动端口号
  "appName": "NoomiRpcApplication", // 应用名称
  "servicePrefix": "com.nodejs.Test", // 服务前缀，需要唯一性，主要针对跨语言开发，比如Java
  "starterPath": ["/dist/module/provider/**/*.js"], // 项目启动目录
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
          "level": "debug"
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
//    "serviceConfig": {
//      "healthy": true,
//      "enabled": true,
//      "weight": 1,
//      "ephemeral": true,
//      "clusterName": "DEFAULT",
//      "groupName": "DEFAULT_GROUP"
//    }
  },
  "loadBalancerType": "RoundRobinLoadBalancer", // 负载均衡器类型
  "serializerType": "json", // 序列化类型
  "compressorType": "gzip", // 压缩类型
  "idGenerator": { // id发号器，生成分布式唯一id
    "dataCenterId": "2", // 数据中心编号
    "machineId": "4" // 机器号
  }
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
5. 在api目录下新建description目录，在description目录新建HelloNoomiRpcDescription.ts文件。内容如下：
```typescript
// HelloNoomiRpcDescription.ts
import {Type} from "@furyjs/fury";
import {Description} from "noomi-rpc-node";
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
6. 回到module目录的provider目录中，新建impl目录，在impl目录中新建HelloNoomiRpcImpl.ts文件，内容如下：
```typescript
// HelloNoomiRpcImpl.ts
import {HelloNoomiRpcDescription} from "../api/description/HelloNoomiRpcDescription";
import {HelloNoomiRpc} from "../api/HelloNoomiRpc";
import {NoomiService} from "noomi-rpc-node";

/**
 * 使用NoomiService进行服务注册
 */
@NoomiService<HelloNoomiRpc, HelloNoomiRpcDescription>({
    interfaceProvider: new HelloNoomiRpc(),
    interfaceDescription: new HelloNoomiRpcDescription(),
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
7. 在项目根目录中新建provider.ts文件，内容如下：
```typescript
import {Starter} from "noomi-rpc-node";

// 启动noomi服务端
Starter.getInstance().start();
```
8. tsc项目，node ./dist/provider.js即可。

### 针对客户端
1. npm i noomi-cli1 -g全局安装noomi脚手架，然后noomi create client创建服务端目录同时npm i noomi-rpc-node。 
2. 在config目录中新建rpc.json文件，内容如下：
```json5
// rpc.json
{
  "port": 8090, // 启动端口号
  "appName": "NoomiRpcApplication", // 应用名称
  "servicePrefix": "com.nodejs.Test", // 服务前缀，需要唯一性，主要针对跨语言开发，比如Java
  "starterPath": ["/dist/module/src/**/*.js"], // 项目启动目录
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
          "level": "debug"
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
//    "serviceConfig": {
//      "healthy": true,
//      "enabled": true,
//      "weight": 1,
//      "ephemeral": true,
//      "clusterName": "DEFAULT",
//      "groupName": "DEFAULT_GROUP"
//    }
  },
  "loadBalancerType": "RoundRobinLoadBalancer", // 负载均衡器类型
  "serializerType": "json", // 序列化类型
  "compressorType": "gzip", // 压缩类型
  "idGenerator": { // id发号器，生成分布式唯一id
    "dataCenterId": "2", // 数据中心编号
    "machineId": "4" // 机器号
  }
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
4. 在api目录下新建description目录，在description目录新建HelloNoomiRpcDescription.ts文件。内容如下：
```typescript
// HelloNoomiRpcDescription.ts
import {Type} from "@furyjs/fury";
import {Description} from "noomi-rpc-node";
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
5. 修改router目录下的hello.route.ts文件，内容如下：
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
6. 修改service目录下的hello.service.ts文件，内容如下：
```typescript
/**
 * 业务层
 */
export interface HelloService {

    sayHello(): string;

    sayHi(): Promise<string>;
}
```
7. 修改/serviceImpl目录下的hello.serviceImpl.ts文件，内容如下：
```typescript
import {Inject, Instance} from "noomi";
import {HelloService} from "../hello.service";
import {HelloDaoImpl} from "../../dao/daoImpl/hello.daoImpl";
import {HelloNoomiRpc} from "../../api/HelloNoomiRpc";
import {NoomiReference} from "noomi-rpc-node";
import {HelloNoomiRpcDescription} from "../../api/description/HelloNoomiRpcDescription";

/**
 * 业务层实现类
 */
@Instance()
export class HelloServiceImpl implements HelloService{

    @Inject(HelloDaoImpl)
    private helloDao: HelloDao

    @NoomiReference({
        interfaceProvider: new HelloNoomiRpc(),
        interfaceDescription: new HelloNoomiRpcDescription()
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
8. tsc项目，node ./dist/app.js即可。
9. 打开浏览器，输入地址http://localhost:3000/hello，输出{"result":"hello,sayHi"}即可。

### 针对跨语言
**针对跨语言，目前noomi-rpc-java正在开发中，敬请期待....其他语言敬请不期待了。**
