/**
 * 对象的wrapper包裹器
 */
export class ObjectWrapper<T> {
    /**
     * 编号
     * @private
     */
    private _code: number;

    /**
     * 类型名
     * @private
     */
    private _name: string;

    /**
     * 具体实现
     * @private
     */
    private _impl: T;


    /**
     * 构造器
     * @param code 编号
     * @param name 类型名
     * @param impl 具体实现
     */
    public constructor(code: number, name: string, impl: T) {
        this._code = code;
        this._name = name;
        this._impl = impl;
    }

    /**
     * ---------------------------以下属性的getter和setter方法---------------------------------------
     */
    get code(): number {
        return this._code;
    }

    set code(value: number) {
        this._code = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get impl(): T {
        return this._impl;
    }

    set impl(value: T) {
        this._impl = value;
    }
}
