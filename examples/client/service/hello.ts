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
    return this.helloNoomiRpcApi.sayHi("Hello World");
  }
}
