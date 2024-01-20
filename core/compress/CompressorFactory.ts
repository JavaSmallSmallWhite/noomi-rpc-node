import {ObjectWrapper} from "../config/ObjectWrapper";
import {Logger} from "../common/logger/Logger";
import {Compressor} from "./Compressor";
import {GzipCompressor} from "./impl/GzipCompressor";

/**
 * 压缩工厂
 */
export class CompressorFactory {
    /**
     * 压缩类型缓存器
     * @private
     */
    private static readonly COMPRESSOR_CACHE: Map<string, ObjectWrapper<Compressor>> = new Map<string, ObjectWrapper<Compressor>>();

    /**
     * 压缩类型编号缓存器
     * @private
     */
    private static readonly COMPRESSOR_CACHE_CODE: Map<number, ObjectWrapper<Compressor>> = new Map<number, ObjectWrapper<Compressor>>();

    /**
     * 类加载时就将所有的压缩器添加到缓存器中
     */
    static {
        const gzipSerializer: ObjectWrapper<Compressor> = new ObjectWrapper<Compressor>(1, "gzip", new GzipCompressor());

        this.COMPRESSOR_CACHE.set("gzip", gzipSerializer);

        this.COMPRESSOR_CACHE_CODE.set(1, gzipSerializer);
    }

    /**
     * 使用工厂方法获取一个CompressorWrapper
     * @param compressorTypeOrCode 序列化类型或序列化码
     */
    public static getCompressor(compressorTypeOrCode: string | number): ObjectWrapper<Compressor> {
        if (typeof compressorTypeOrCode === "string") {
            const compressorObjectWrapper: ObjectWrapper<Compressor> = this.COMPRESSOR_CACHE.get(compressorTypeOrCode);
            if (!compressorObjectWrapper) {
                Logger.error(`未找到您配置的${compressorTypeOrCode}压缩器，默认选用1号gzip的压缩器。`);
                return this.COMPRESSOR_CACHE.get("gzip");
            }
            return this.COMPRESSOR_CACHE.get(compressorTypeOrCode);
        }
        if (typeof compressorTypeOrCode === "number") {
            const compressorObjectWrapper: ObjectWrapper<Compressor> = this.COMPRESSOR_CACHE_CODE.get(compressorTypeOrCode);
            if (!compressorObjectWrapper) {
                Logger.error(`未找到您配置的编号为${compressorTypeOrCode}压缩器，默认选用1号gzip的压缩器。`);
                return this.COMPRESSOR_CACHE_CODE.get(1);
            }
            return this.COMPRESSOR_CACHE_CODE.get(compressorTypeOrCode);
        }
        Logger.error("不存在您所指定的压缩类型或压缩码，默认选用1号gzip的压缩器。");
        return this.COMPRESSOR_CACHE_CODE.get(1);
    }

    /**
     * 新增一个压缩器
     * @param compressorObjectWrapper 压缩wrapper
     */
    public static addLoadBalancer(compressorObjectWrapper: ObjectWrapper<Compressor>): void {
        this.COMPRESSOR_CACHE.set(compressorObjectWrapper.name, compressorObjectWrapper);
        this.COMPRESSOR_CACHE_CODE.set(compressorObjectWrapper.code, compressorObjectWrapper);
    }
}
