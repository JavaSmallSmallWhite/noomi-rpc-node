/**
 * 响应类型
 */
export enum ResponseType {
    /**
     * 普通响应
     */
    SUCCESS_COMMON = 200,
    SUCCESS_COMMON_DESCRIPTION = "普通请求响应成功",

    /**
     * 心跳响应
     */
    SUCCESS_HEART_BEAT = 201,
    SUCCESS_HEART_BEAT_DESCRIPTION = "心跳检测请求响应成功",

    /**
     * 限流
     */
    RATE_LIMIT = 310,
    RATE_LIMIT_DESCRIPTION = "服务被限流",

    /**
     * 资源找不到
     */
    RESOURCE_NOT_FOUND = 404,
    RESOURCE_NOT_FOUND_DESCRIPTION = "请求的资源不存在",

    /**
     * 调用方法异常
     */
    FAIL = 500,
    FAIL_DESCRIPTION = "调用方法发生异常",

    /**
     * 服务器关闭
     */
    BE_CLOSING = 510,
    BE_CLOSING_DESCRIPTION = "服务器正在关闭"
}
