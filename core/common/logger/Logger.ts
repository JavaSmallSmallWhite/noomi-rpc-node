import { Config, Log } from "../utils/TypesUtil";
import { Application } from "../utils/ApplicationUtil";

/**
 * 日志处理类
 */
export class Logger {
  /**
   * 日志对象
   * @private
   */
  private static logger: Log;

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

  /**
   * 配置日志信息
   * @param configuration 日志配置
   * @param use 使用的日志配置
   */
  public static configLog4js(configuration: Config, use: string): void {
    Application.log4js.configure(configuration);
    this.logger = Application.log4js.getLogger(use);
  }

  /**
   * 获取logger
   */
  public static getLogger(): Log {
    return this.logger;
  }
}
