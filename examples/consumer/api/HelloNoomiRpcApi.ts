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

export interface HelloNoomiRpcApi {
  /**
   * 通用接口，server和client都需要依赖
   * @param msg 具体的消息
   * @return 返回的结果
   */
  sayHi(msg: string, msg1?: number): Promise<{ number: number }>;

  /**
   * 通用接口，server和client都需要依赖
   * @param msg 具体的消息
   * @return 返回的结果
   */
  sayHello(msg: string): Promise<string>;
}
