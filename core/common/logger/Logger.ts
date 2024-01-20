import * as log4js from "log4js";

/**
 * 日志处理类
 */
export class Logger {
    /**
     * 日志对象
     * @private
     */
    private static logger: log4js.Logger = log4js.getLogger();

    /**
     * 输出info类型日志
     * @param msg 具体日志信息
     */
    public static info(msg: string | Buffer): void {
        this.logger.level = "info"
        if (this.logger.isInfoEnabled()) {
            this.logger.info(msg);
        }
    }

    /**
     * 输出debug类型日志
     * @param msg 具体日志信息
     */
    public static debug(msg: string | Buffer): void {
        this.logger.level = "debug"
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(msg);
        }
    }

    /**
     * 输出error类型日志
     * @param msg 具体日志信息
     */
    public static error(msg: string | Buffer): void {
        this.logger.level = "error"
        if (this.logger.isErrorEnabled()) {
            this.logger.error(msg);
        }
    }
}
