/**
 * 协议的常量
 */
export class MessageConstant {
    /**
     * 魔术指
     */
    public static readonly MAGIC: Buffer = Buffer.from("soft");

    /**
     * 魔术指字段长度
     */
    public static readonly MAGIC_FIELD_LENGTH: number = this.MAGIC.length;

    /**
     * 版本号
     */
    public static readonly VERSION: number = 1;

    /**
     * 头部长度字节
     */
    public static readonly HEADER_LENGTH: number = (this.MAGIC_FIELD_LENGTH + 1 + 2 + 4 + 1 + 1 + 1 + 8 + 8 + 8);

    /**
     * 头部长度占用字节
     */
    public static readonly HEADER_FIELD_LENGTH: number = 2;

    /**
     * 版本长度占用字节
     */
    public static readonly VERSION_FIELD_LENGTH: number = 1;

    /**
     * 总长度占用字节
     */
    public static readonly FULL_FIELD_LENGTH: number = 4;

    /**
     * 请求类型占用长度字节
     */
    public static readonly REQUEST_TYPE_FIELD_LENGTH: number = 1;

    /**
     * 序列化长度占用字节
     */
    public static readonly SERIALIZER_TYPE_FIELD_LENGTH: number = 1;

    /**
     * 压缩长度占用字节
     */
    public static readonly COMPRESSOR_TYPE_FIELD_LENGTH: number = 1;

    /**
     * 请求id字段占用字节
     */
    public static readonly REQUEST_ID_FIELD_LENGTH: number = 8;

    /**
     * description id字段占用字节
     */
    public static readonly DESCRIPTION_ID_FIELD_LENGTH: number = 8;

    /**
     * description size字段占用字节
     */
    public static readonly DESCRIPTION_SIZE_FIELD_LENGTH: number = 8;

    /**
     * 响应类型占用长度字节
     */
    public static readonly RESPONSE_TYPE_FIELD_LENGTH: number = 1;
}
