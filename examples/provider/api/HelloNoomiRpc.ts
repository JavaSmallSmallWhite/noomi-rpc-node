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
