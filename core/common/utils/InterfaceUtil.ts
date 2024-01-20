/**
 * 服务工具类
 */
export class InterfaceUtil {

    /**
     * 组合服务前缀和接口名称
     * @param servicePrefix 服务前缀
     * @param interfaceName 接口名称
     */
    public static combine(servicePrefix: string, interfaceName: string):  string {
        return servicePrefix + "." + interfaceName;
    }

    /**
     * 获取实例对象的接口名
     * @param interfaceObj 接口的实例对象
     */
    public static getInterfaceName(interfaceObj: Object): string {
        const interfaceName: string = interfaceObj.constructor.name;
        if (interfaceName) {
            return interfaceName;
        } else {
            return this.getInterfaceName(Object.getPrototypeOf(interfaceObj));
        }
    }

    /**
     * 获取接口对象上所有的定义的方法名
     * @param interfaceObj 接口对象
     * @param description 是否接口描述类
     */
    public static getInterfaceMethodsName(interfaceObj: Object, description?: boolean): Array<string> {
        const interfacePrototype: ObjectConstructor = Object.getPrototypeOf(interfaceObj);
        const propertyNames: Array<string> = Object.getOwnPropertyNames(interfacePrototype);
        if (description) {
            return propertyNames.filter(methodName => methodName.endsWith("Description")
                && typeof interfaceObj[methodName] === "function");
        }
        return propertyNames.filter(methodName => methodName !== "constructor"
            && typeof interfaceObj[methodName] === "function");
    }

    /**
     * 判断该对象是否是某个类的实例
     * @param obj 对象
     * @param classConstructor 类
     * @private
     */
    private static isInstanceOfClass(obj: Object, classConstructor: Function): boolean {
        return obj instanceof classConstructor || Object.getPrototypeOf(obj) === classConstructor.prototype;
    }
}
