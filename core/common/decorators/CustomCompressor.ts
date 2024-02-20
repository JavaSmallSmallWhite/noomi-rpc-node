import {ObjectWrapper} from "../../configuration/ObjectWrapper";
import {CompressorFactory} from "../../compress/CompressorFactory";
import {Compressor} from "../../compress/Compressor";
import {NoomiRpcStarter} from "../../NoomiRpcStarter";

/**
 * 自定义添加压缩器的选项
 */
interface CompressorOption {
    /**
     * 压缩器id，框架自带1号和2号压缩器，不可与框架自带的压缩器名称重复
     */
    compressorId: number,

    /**
     * 是否使用
     */
    isUse: boolean,

    /**
     * 序列化器名称，不可与框架自带的压缩器名称重复
     */
    compressorName?: string
}

/**
 * 压缩装饰器，用于添加自定义的压缩器，装饰类
 * @constructor
 */
export function CustomCompressor(compressorOption: CompressorOption): (target: Function) => void {
    return (target: Function): void => {
        const compressorName: string = compressorOption["compressorName"] || target.name
        CompressorFactory.addCompressor(
            new ObjectWrapper<Compressor>(
                compressorOption["compressorId"],
                compressorName,
                Reflect.construct(target, [])
            )
        );
        if (compressorOption["isUse"]) {
            NoomiRpcStarter.getInstance().getConfiguration().loadBalancerType = compressorName;
        }
    }
}
