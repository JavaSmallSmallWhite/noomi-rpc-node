import {DateError} from "../error/DateError";
import {Logger} from "../logger/Logger";

/**
 * 雪花算法生成分布式请求id
 */
export class IdGeneratorUtil {

    /**
     * 起始时间戳
     * @private
     */
    private static readonly START_STAMP: bigint = BigInt(new Date("2022-1-1").getTime());

    /**
     * 数据中心(机房号)的位数
     * @private
     */
    private static readonly DATA_CENTER_BIT: bigint = 5n;

    /**
     * 机器号的位数
     * @private
     */
    private static readonly MACHINE_BIT: bigint = 5n;

    /**
     * 序列号的位数
     * @private
     */
    private static readonly SEQUENCE_BIT: bigint = 12n;

    /**
     * 数据中心的最大值
     * @private
     */
    private static readonly DATA_CENTER_MAX: bigint = -1n ^ (-1n << this.DATA_CENTER_BIT);

    /**
     * 机器号最大值
     * @private
     */
    private static readonly MACHINE_MAX: bigint = -1n ^ (-1n << this.MACHINE_BIT);

    /**
     * 序列号最大值
     * @private
     */
    private static readonly SEQUENCE_MAX: bigint = -1n ^ (-1n << this.SEQUENCE_BIT);

    /**
     * 时间差的偏移量
     * @private
     */
    private static readonly TIMESTAMP_LEFT: bigint = this.DATA_CENTER_BIT + this.MACHINE_BIT + this.SEQUENCE_BIT;

    /**
     * 数据中心编号的偏移量
     * @private
     */
    private static readonly DATA_CENTER_LEFT: bigint = this.MACHINE_BIT + this.SEQUENCE_BIT;

    /**
     * 机器号的偏移量
     * @private
     */
    private static readonly MACHINE_LEFT: bigint = this.SEQUENCE_BIT;

    /**
     * 数据中心id
     * @private
     */
    private readonly dataCenterId: bigint;

    /**
     * 机器id
     * @private
     */
    private readonly machineId: bigint;

    /**
     * 序列id
     * @private
     */
    private sequenceId: bigint = 0n;

    /**
     * 上一次的时间差
     * @private
     */
    private lastTimeStamp: bigint = -1n;

    /**
     * 初始化数据中心编号和机器号
     * @param dataCenterId 数据中心编号
     * @param machineId 机器号
     */
    public constructor(dataCenterId: bigint, machineId: bigint) {
        if (dataCenterId > IdGeneratorUtil.DATA_CENTER_MAX || dataCenterId < 0n) {
            throw new TypeError("您传入的数据中心编号不合法。");
        }

        if (machineId > IdGeneratorUtil.MACHINE_MAX || machineId < 0n) {
            throw new TypeError("您输入的机器编号不合法。");
        }
        this.dataCenterId = dataCenterId;
        this.machineId = machineId;
    }

    /**
     * 获取分布式id，发生时间回溯直接抛错
     */
    public getId(): bigint {
        const currentTime: bigint = BigInt(Date.now());
        let timeStamp: bigint = currentTime - IdGeneratorUtil.START_STAMP;
        if (timeStamp < this.lastTimeStamp) {
            throw new DateError("您的服务器进行了时钟回调。");
        }
        if (timeStamp == this.lastTimeStamp) {
            this.sequenceId++;
            if (this.sequenceId >= IdGeneratorUtil.SEQUENCE_MAX) {
                timeStamp = this.getNextTimeStamp();
                this.sequenceId = 0n;
            }
        } else {
            this.sequenceId = 0n;
        }

        this.lastTimeStamp = timeStamp;
        const sequence: bigint = this.sequenceId;
        const requestId: bigint = timeStamp << IdGeneratorUtil.TIMESTAMP_LEFT | this.dataCenterId << IdGeneratorUtil.DATA_CENTER_LEFT | this.machineId << IdGeneratorUtil.MACHINE_LEFT | sequence;
        Logger.debug(`请求id为${requestId}`);
        return requestId;
    }

    /**
     * 获取下一个timeStamp
     * @private
     */
    private getNextTimeStamp(): bigint {
        let current: bigint = BigInt(Date.now()) - IdGeneratorUtil.START_STAMP;
        while (current === this.lastTimeStamp) {
            current = BigInt(new Date().valueOf()) - IdGeneratorUtil.START_STAMP;
        }
        return current;
    }
}
