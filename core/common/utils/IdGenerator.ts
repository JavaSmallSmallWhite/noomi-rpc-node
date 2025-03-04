import { Logger } from "../logger/Logger";
import { NoomiRpcError } from "../error/NoomiRpcError";
import { TipManager } from "../error/TipManager";

/**
 * 雪花算法生成分布式请求id
 */
export class IdGenerator {
  /**
   * 起始时间戳
   * @private
   */
  static readonly #START_STAMP: bigint = BigInt(new Date("2022-1-1").getTime());

  /**
   * 数据中心(机房号)的位数
   * @private
   */
  static readonly #DATA_CENTER_BIT: bigint = 5n;

  /**
   * 机器号的位数
   * @private
   */
  static readonly #MACHINE_BIT: bigint = 5n;

  /**
   * 序列号的位数
   * @private
   */
  static readonly #SEQUENCE_BIT: bigint = 12n;

  /**
   * 数据中心的最大值
   * @private
   */
  static readonly #DATA_CENTER_MAX: bigint = -1n ^ (-1n << this.#DATA_CENTER_BIT);

  /**
   * 机器号最大值
   * @private
   */
  static readonly #MACHINE_MAX: bigint = -1n ^ (-1n << this.#MACHINE_BIT);

  /**
   * 序列号最大值
   * @private
   */
  static readonly #SEQUENCE_MAX: bigint = -1n ^ (-1n << this.#SEQUENCE_BIT);

  /**
   * 时间差的偏移量
   * @private
   */
  static readonly #TIMESTAMP_LEFT: bigint =
    this.#DATA_CENTER_BIT + this.#MACHINE_BIT + this.#SEQUENCE_BIT;

  /**
   * 数据中心编号的偏移量
   * @private
   */
  static readonly #DATA_CENTER_LEFT: bigint = this.#MACHINE_BIT + this.#SEQUENCE_BIT;

  /**
   * 机器号的偏移量
   * @private
   */
  static readonly #MACHINE_LEFT: bigint = this.#SEQUENCE_BIT;

  /**
   * 数据中心id
   * @private
   */
  readonly #dataCenterId: bigint;

  /**
   * 机器id
   * @private
   */
  readonly #machineId: bigint;

  /**
   * 序列id
   * @private
   */
  #sequenceId: bigint = 0n;

  /**
   * 上一次的时间差
   * @private
   */
  #lastTimeStamp: bigint = -1n;

  /**
   * 初始化数据中心编号和机器号
   * @param dataCenterId 数据中心编号
   * @param machineId 机器号
   */
  public constructor(dataCenterId: bigint, machineId: bigint) {
    if (dataCenterId > IdGenerator.#DATA_CENTER_MAX || dataCenterId < 0n) {
      throw new NoomiRpcError("0300");
    }

    if (machineId > IdGenerator.#MACHINE_MAX || machineId < 0n) {
      throw new NoomiRpcError("0301");
    }
    this.#dataCenterId = dataCenterId;
    this.#machineId = machineId;
  }

  /**
   * 获取分布式id，发生时间回溯直接抛错
   */
  public getId(): bigint {
    const currentTime: bigint = BigInt(Date.now());
    let timeStamp: bigint = currentTime - IdGenerator.#START_STAMP;
    if (timeStamp < this.#lastTimeStamp) {
      throw new NoomiRpcError("0302");
    }
    if (timeStamp == this.#lastTimeStamp) {
      this.#sequenceId++;
      if (this.#sequenceId >= IdGenerator.#SEQUENCE_MAX) {
        timeStamp = this.#getNextTimeStamp();
        this.#sequenceId = 0n;
      }
    } else {
      this.#sequenceId = 0n;
    }

    this.#lastTimeStamp = timeStamp;
    const sequence: bigint = this.#sequenceId;
    const requestId: bigint =
      (timeStamp << IdGenerator.#TIMESTAMP_LEFT) |
      (this.#dataCenterId << IdGenerator.#DATA_CENTER_LEFT) |
      (this.#machineId << IdGenerator.#MACHINE_LEFT) |
      sequence;
    Logger.debug(TipManager.getTip("0123", requestId.toString()));
    return requestId;
  }

  /**
   * 获取下一个timeStamp
   * @private
   */
  #getNextTimeStamp(): bigint {
    let current: bigint = BigInt(Date.now()) - IdGenerator.#START_STAMP;
    while (current === this.#lastTimeStamp) {
      current = BigInt(new Date().valueOf()) - IdGenerator.#START_STAMP;
    }
    return current;
  }
}
