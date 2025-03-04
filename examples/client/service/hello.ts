import { Route, Router } from "noomi";
import { HelloNoomiRpcApi, HelloNoomiRpcDescription } from "../api/HelloNoomiRpcApi";
import { NoomiReference } from "../../../core/common/decorators/NoomiReference";

@Router({
  namespace: "/hello",
  path: "*"
})
export class HelloRoute {
  @NoomiReference<HelloNoomiRpcApi>({
    interfaceName: "HelloNoomiRpcApi",
    interfaceFileName: "HelloNoomiRpcApi.ts",
    serviceName: "com.nodejs.server.js",
    description: HelloNoomiRpcDescription
  })
  private helloNoomiRpcApi: HelloNoomiRpcApi;

  @Route("/message")
  public async getMessage(): Promise<string> {
    for (let i = 0; i < 10; i++) {
      const res = await this.helloNoomiRpcApi.sayHi("Hello World");
      console.log(res);
    }
    return "ok";
  }

  @Route("/message10")
  public async getMessage10(): Promise<string> {
    console.time("noomi-rpc-node请求响应时间");
    for (let i = 0; i < 10; i++) {
      const res = await this.helloNoomiRpcApi.sayHi("Hello World");
      console.log(res);
    }
    console.timeEnd("noomi-rpc-node请求响应时间");
    return "ok";
  }

  @Route("/message50")
  public async getMessage50(): Promise<string> {
    console.time("noomi-rpc-node请求响应时间");
    for (let i = 0; i < 50; i++) {
      const res = await this.helloNoomiRpcApi.sayHi("Hello World");
      console.log(res);
    }
    console.timeEnd("noomi-rpc-node请求响应时间");
    return "ok";
  }

  @Route("/message100")
  public async getMessage100(): Promise<string> {
    console.time("noomi-rpc-node请求响应时间");
    for (let i = 0; i < 100; i++) {
      const res = await this.helloNoomiRpcApi.sayHi("Hello World");
      console.log(res);
    }
    console.timeEnd("noomi-rpc-node请求响应时间");
    return "ok";
  }

  @Route("/message250")
  public async getMessage250(): Promise<string> {
    console.time("noomi-rpc-node请求响应时间");
    for (let i = 0; i < 250; i++) {
      const res = await this.helloNoomiRpcApi.sayHi("Hello World");
      console.log(res);
    }
    console.timeEnd("noomi-rpc-node请求响应时间");
    return "ok";
  }

  @Route("/message500")
  public async getMessage500(): Promise<string> {
    console.time("noomi-rpc-node请求响应时间");
    for (let i = 0; i < 500; i++) {
      const res = await this.helloNoomiRpcApi.sayHi("Hello World");
      console.log(res);
    }
    console.timeEnd("noomi-rpc-node请求响应时间");
    return "ok";
  }

  @Route("/message1000")
  public async getMessage1000(): Promise<string> {
    console.time("noomi-rpc-node请求响应时间");
    for (let i = 0; i < 1000; i++) {
      const res = await this.helloNoomiRpcApi.sayHi("Hello World");
      console.log(res);
    }
    console.timeEnd("noomi-rpc-node请求响应时间");
    return "ok";
  }
}
