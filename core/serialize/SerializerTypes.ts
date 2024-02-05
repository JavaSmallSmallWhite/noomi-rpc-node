/**
 * 自定义添加序列化器的选项
 */
export interface SerializerOption {
    /**
     * 序列化器id，框架自带1号和2号序列化器，不可与框架自带的序列化器名称重复
     */
    serializerId: number,

    /**
     * 是否使用
     */
    isUse: boolean,

    /**
     * 序列化器名称，不可与框架自带的序列化器名称重复
     */
    serializerName?: string
}
