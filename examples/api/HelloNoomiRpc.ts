/**
 * 接口定义
 */
export abstract class HelloNoomiRpc {

    /**
     * 通用接口，server和client都需要依赖
     * @param msg 具体的消息
     * @return 返回的结果
     */
    public abstract sayHi(msg: string): Promise<string>

    /**
     * 通用接口，server和client都需要依赖
     * @param msg 具体的消息
     * @return 返回的结果
     */
    public abstract sayHello(msg: string): Promise<string>
}
