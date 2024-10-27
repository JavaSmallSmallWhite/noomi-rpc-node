/**
 * 接口定义
 */
export interface HelloNoomiRpcApi {
  /**
   * 通用接口，server和client都需要依赖
   * @param name
   * @param age
   */
  sayHi(name: string, age?: number): Promise<{ number: number }>;

  /**
   * 通用接口，server和client都需要依赖
   * @param msg 具体的消息
   * @return 返回的结果
   */
  sayHello(msg: string): void;
}
