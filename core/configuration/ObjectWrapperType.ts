/**
 * 未知类
 */
export type UnknownClass = { new (...args: unknown[]): void };

/**
 * 对象包裹器类型
 */
export type ObjectWrapperType = [number, string, UnknownClass | unknown];
