import { ObjectWrapper } from "../configuration/ObjectWrapper";
import { Logger } from "../common/logger/Logger";
import { Compressor } from "./Compressor";
import { GzipCompressor } from "./impl/GzipCompressor";
import { DeflateCompressor } from "./impl/DeflateCompressor";
import { DeflateRawCompressor } from "./impl/DeflateRawCompressor";
import { BrotliCompressor } from "./impl/BrotliCompressor";
import { ObjectWrapperFactory } from "../configuration/ObjectWrapperFactory";
import { ObjectWrapperType, UnknownClass } from "../configuration/ObjectWrapperType";
import { InstanceFactory } from "noomi";
import { NoomiRpcError } from "../common/error/NoomiRpcError";
import { TipManager } from "../common/error/TipManager";

/**
 * 压缩工厂
 */
export class CompressorFactory {
  /**
   * 压缩类型缓存器
   * @private
   */
  private static readonly COMPRESSOR_CACHE: Map<string, ObjectWrapper<Compressor>> = new Map<
    string,
    ObjectWrapper<Compressor>
  >();

  /**
   * 压缩类型编号缓存器
   * @private
   */
  private static readonly COMPRESSOR_CACHE_CODE: Map<number, ObjectWrapper<Compressor>> = new Map<
    number,
    ObjectWrapper<Compressor>
  >();

  /**
   * 类加载时就将所有的压缩器添加到缓存器中
   */
  static {
    InstanceFactory.addInstance(GzipCompressor, { singleton: true });
    InstanceFactory.addInstance(DeflateCompressor, { singleton: true });
    InstanceFactory.addInstance(DeflateRawCompressor, { singleton: true });
    InstanceFactory.addInstance(BrotliCompressor, { singleton: true });

    ObjectWrapperFactory.addObjectWrapperConfig("gzip", [1, "gzip", GzipCompressor]);
    ObjectWrapperFactory.addObjectWrapperConfig("deflate", [1, "deflate", DeflateCompressor]);
    ObjectWrapperFactory.addObjectWrapperConfig("deflateRaw", [
      1,
      "deflateRaw",
      DeflateRawCompressor
    ]);
    ObjectWrapperFactory.addObjectWrapperConfig("brotli", [1, "brotli", BrotliCompressor]);

    // const gzipCompressor: ObjectWrapper<Compressor> = new ObjectWrapper<Compressor>(1, "gzip", new GzipCompressor());
    // const deflateCompressor: ObjectWrapper<Compressor> = new ObjectWrapper<Compressor>(2, "deflate", new DeflateCompressor());
    // const deflateRawCompressor: ObjectWrapper<Compressor> = new ObjectWrapper<Compressor>(3, "deflateRaw", new DeflateRawCompressor());
    // const brotliCompressor: ObjectWrapper<Compressor> = new ObjectWrapper<Compressor>(4, "brotli", new BrotliCompressor());
    //
    // this.COMPRESSOR_CACHE.set("gzip", gzipCompressor);
    // this.COMPRESSOR_CACHE.set("deflate", deflateCompressor);
    // this.COMPRESSOR_CACHE.set("deflateRaw", deflateRawCompressor);
    // this.COMPRESSOR_CACHE.set("brotli", brotliCompressor);
    //
    // this.COMPRESSOR_CACHE_CODE.set(1, gzipCompressor);
    // this.COMPRESSOR_CACHE_CODE.set(2, deflateCompressor);
    // this.COMPRESSOR_CACHE_CODE.set(3, deflateRawCompressor);
    // this.COMPRESSOR_CACHE_CODE.set(4, brotliCompressor);
  }

  /**
   * 使用工厂方法获取一个CompressorWrapper
   * @param compressorTypeOrCode 压缩类型或压缩器码
   */
  public static getCompressor(compressorTypeOrCode: string | number): ObjectWrapper<Compressor> {
    if (typeof compressorTypeOrCode === "string") {
      const compressorObjectWrapper: ObjectWrapper<Compressor> =
        this.COMPRESSOR_CACHE.get(compressorTypeOrCode);
      if (!compressorObjectWrapper) {
        Logger.error(TipManager.getTip("0127", compressorTypeOrCode));
        return this.COMPRESSOR_CACHE.get("gzip");
      }
      return this.COMPRESSOR_CACHE.get(compressorTypeOrCode);
    }
    if (typeof compressorTypeOrCode === "number") {
      const compressorObjectWrapper: ObjectWrapper<Compressor> =
        this.COMPRESSOR_CACHE_CODE.get(compressorTypeOrCode);
      if (!compressorObjectWrapper) {
        Logger.error(TipManager.getTip("0128", compressorTypeOrCode));
        return this.COMPRESSOR_CACHE_CODE.get(1);
      }
      return this.COMPRESSOR_CACHE_CODE.get(compressorTypeOrCode);
    }
    Logger.error(TipManager.getTip("0129"));
    return this.COMPRESSOR_CACHE_CODE.get(1);
  }

  /**
   * 新增一个压缩器
   * @param compressorObjectWrapper 压缩wrapper或者名称
   */
  public static addCompressor(
    compressorObjectWrapper: ObjectWrapper<Compressor> | string
  ): ObjectWrapper<Compressor> {
    if (typeof compressorObjectWrapper === "string") {
      const compressorConfig: ObjectWrapperType =
        ObjectWrapperFactory.getObjectWrapperConfig(compressorObjectWrapper);
      compressorConfig[2] = <Compressor>(
        InstanceFactory.getInstance(<UnknownClass>compressorConfig[2])
      );
      const compressorWrapper: ObjectWrapper<Compressor> = <ObjectWrapper<Compressor>>(
        Reflect.construct(ObjectWrapper, compressorConfig)
      );
      this.COMPRESSOR_CACHE.set(compressorConfig[1], compressorWrapper);
      this.COMPRESSOR_CACHE_CODE.set(compressorConfig[0], compressorWrapper);
      return compressorWrapper;
    }
    if (this.COMPRESSOR_CACHE_CODE.has(compressorObjectWrapper.code)) {
      throw new NoomiRpcError("0502", compressorObjectWrapper.code);
    }
    if (this.COMPRESSOR_CACHE.has(compressorObjectWrapper.name)) {
      throw new NoomiRpcError("0503", compressorObjectWrapper.name);
    }
    this.COMPRESSOR_CACHE.set(compressorObjectWrapper.name, compressorObjectWrapper);
    this.COMPRESSOR_CACHE_CODE.set(compressorObjectWrapper.code, compressorObjectWrapper);
    return compressorObjectWrapper;
  }
}
