import {ObjectWrapper} from "../../configuration/ObjectWrapper";
import {Starter} from "../../index";
import {CompressorConfig} from "../../compress/CompressorTypes";
import {CompressorFactory} from "../../compress/CompressorFactory";
import {Compressor} from "../../compress/Compressor";

/**
 * 压缩装饰器，用于添加自定义的压缩器，装饰类
 * @constructor
 */
export function Compressor(compressorConfig: CompressorConfig): (target: Function) => void {
    return (target: Function): void => {
        const compressorName: string = compressorConfig["compressorName"] || target.name
        CompressorFactory.addCompressor(
            new ObjectWrapper<Compressor>(
                compressorConfig["compressorId"],
                compressorName,
                Reflect.construct(target, [])
            )
        );
        if (compressorConfig["isUse"]) {
            Starter.getInstance().getConfiguration().loadBalancerType = compressorName;
        }
    }
}
