import { NoomiRpcStarter } from "../../NoomiRpcStarter";
import { Util } from "noomi";
import { NoomiRpcTip_en } from "../../locales/NoomiRpcTip";
import { NoomiRpcTip_zh } from "../../locales/NoomiRpcTip";

/**
 * 获取Tip信息
 */
export class TipManager {
  /**
   * 获取消息
   * @param type -    类型
   * @param code -    错误码
   * @param params -  参数
   * @returns         提示信息
   */
  private static get(
    type: "tip" | "error" | "model",
    code: string,
    ...params: Array<unknown>
  ): string {
    const msg: { tip: object; error: object; model: object } = NoomiRpcTip_zh;
    // const language = NoomiRpcStarter.getInstance().getConfiguration().language;
    // switch (language) {
    //   case "en":
    //     msg = NoomiRpcTip_en;
    //     break;
    //   default:
    //     msg = NoomiRpcTip_zh;
    // }
    if (params.length > 0) {
      return Util.compileString(msg[type][code], ...params);
    }
    return msg[type][code];
  }

  /**
   * 获取提示信息
   * @param code -    提示码
   * @param params -  参数
   * @returns         提示信息
   */
  public static getTip(code: string, ...params: Array<unknown>): string {
    return this.get("tip", code, ...params);
  }

  /**
   * 获取异常信息
   * @param code -    提示码
   * @param params -  参数
   * @returns         异常信息
   */
  public static getError(code: string, ...params: Array<unknown>): string {
    return this.get("error", code, ...params) || this.get("error", "0000");
  }

  /**
   * 获取模型校验或验证信息
   * @param code -    提示码
   * @param params -   参数
   * @returns         信息
   */
  public static getModel(code: string, ...params: Array<unknown>): string {
    return this.get("model", code, ...params);
  }
}
