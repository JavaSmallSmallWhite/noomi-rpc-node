import { Socket } from "../common/utils/TypesUtil";

/**
 * 所有通道处理器的Handler
 */
export interface Handler {
  /**
   * 自动处理器
   * @param socketChannel socket通道
   * @param args 其余参数
   */
  process(socketChannel: Socket, args?: unknown): Promise<unknown>;
}
