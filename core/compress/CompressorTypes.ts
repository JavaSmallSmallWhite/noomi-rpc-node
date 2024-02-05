/**
 * 自定义添加压缩器的选项
 */
export interface CompressorOption {
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
