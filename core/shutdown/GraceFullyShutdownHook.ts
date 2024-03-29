import {ShutdownHolder} from "./ShutdownHolder";
import {Logger} from "../common/logger/Logger";

/**
 * 服务端的优雅关闭
 */
export class GraceFullyShutdownHook {

    /**
     * 服务端关闭执行函数
     */
    public static async run(): Promise<void> {
        Logger.info("进程关闭中.....");
        ShutdownHolder.BAFFLE = true;

        const start: number = Date.now();
        while (true) {
            await new Promise((resolve): void => {
                setTimeout(function (): void {
                    resolve(null);
                }, 100);
            });
            if (ShutdownHolder.REQUEST_COUNTER == 0 || Date.now() - start > 10000) {
                console.log(ShutdownHolder.REQUEST_COUNTER);
                break;
            }
        }
        Logger.info("进程关闭结束。");
        process.exit(0);
    }
}
