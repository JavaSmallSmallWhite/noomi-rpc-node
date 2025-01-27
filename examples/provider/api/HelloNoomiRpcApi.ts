// /**
//  * 接口定义
//  */
// export interface HelloNoomiRpcApi {
//   /**
//    * 通用接口，server和client都需要依赖
//    * @param name
//    * @param age
//    */
//   sayHi(name: string, age?: number): Promise<{ number: number }>;
//
//   /**
//    * 通用接口，server和client都需要依赖
//    * @param msg 具体的消息
//    * @return 返回的结果
//    */
//   sayHello(msg: string): void;
// }
import { Type } from "@furyjs/fury";
import { genDescription } from "../../consumer/basic/Object";

const description = genDescription();
export class HelloNoomiRpcDescription {
  sayHi() {
    return [Type.array(description), description];
  }
}

export interface HelloNoomiRpcApi {
  sayHi(msg: unknown): Promise<unknown>;

  sayHello(msg: string): Promise<string>;
}
