import {getLogger, Logger as Log} from "log4js";

/**
 * 日志处理类
 */
export class Logger {
    /**
     * 日志对象
     * @private
     */
    public static readonly logger: Log = getLogger();

    /**
     * 输出info类型日志
     * @param msg 具体日志信息
     */
    public static info(msg: string | Buffer): void {
        if (this.logger.isInfoEnabled()) {
            this.logger.info(msg);
        }
    }

    /**
     * 输出debug类型日志
     * @param msg 具体日志信息
     */
    public static debug(msg: string | Buffer): void {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(msg);
        }
    }

    /**
     * 输出error类型日志
     * @param msg 具体日志信息
     */
    public static error(msg: string | Buffer): void {
        if (this.logger.isErrorEnabled()) {
            this.logger.error(msg);
        }
    }
}
