import {ObjectWrapper} from "../../configuration/ObjectWrapper";
import {Starter} from "../../index";
import {CompressorOption} from "../../compress/CompressorTypes";
import {CompressorFactory} from "../../compress/CompressorFactory";
import {Compressor} from "../../compress/Compressor";

/**
 * 压缩装饰器，用于添加自定义的压缩器，装饰类
 * @constructor
 */
export function Compressor(compressorOption: CompressorOption): (target: Function) => void {
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
            Starter.getInstance().getConfiguration().loadBalancerType = compressorName;
        }
    }
}
