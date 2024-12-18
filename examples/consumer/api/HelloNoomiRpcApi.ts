import { Type } from "@furyjs/fury";

/**
 * 接口定义
 */
// export class HelloNoomiRpc {
//
//     /**
//      * 通用接口，server和client都需要依赖
//      * @param name 具体的消息
//      * @param age
//      * @return 返回的结果
//      */
//     sayHi(name: string, age?: number): Promise<{number: number}> {
//         throw new Error("")
//     }
//
//     /**
//      * 通用接口，server和client都需要依赖
//      * @param msg 具体的消息
//      * @return 返回的结果
//      */
//     sayHello(msg: string): string {
//         throw new Error("")
//     }
// }
const baseDescription = {
  errorMessage: Type.string(),
  code: Type.int32()
};

export class HelloNoomiRpcDescription {
  sayHi() {
    return [
      Type.tuple([Type.string(), Type.int32()]),
      Type.object("500", { number: Type.int32(), errorMessage: Type.string(), ...baseDescription })
    ];
  }
}

export interface HelloNoomiRpcApi {
  sayHi(msg: string, msg1?: number): Promise<{ number: number }>;

  sayHello(msg: string): Promise<string>;
}
