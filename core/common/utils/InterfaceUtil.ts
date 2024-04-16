import {Dirent, readdirSync} from "fs";
import {resolve} from "path"

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
     */
    public static getInterfaceMethodsName(interfaceObj: Object): Array<string> {
        // const interfacePrototype: ObjectConstructor = Object.getPrototypeOf(interfaceObj);
        const propertyNames: Array<string> = Object.getOwnPropertyNames(interfaceObj);
        return propertyNames.filter(methodName => methodName !== "constructor"
            && typeof interfaceObj[methodName] === "function");
    }

    /**
     * 加载所有的装饰器
     * @param path 目录路径
     */
    public static loadDecorators(path: string | string[]): void {
        if (Array.isArray(path)) {
            for (const p of path) {
                handle(p);
            }
        } else {
            handle(path);
        }

        /**
         * 处理instance路径
         * @param path -  待解析路径
         */
        function handle(path: string): void {
            const basePath: string = process.cwd();
            const pathArr: string[] = path.split('/');
            const pa: string[] = [basePath];
            let handled: boolean = false;    // 是否已处理
            for (let i = 0; i < pathArr.length - 1; i++) {
                const p: string = pathArr[i];
                if (p.indexOf('*') === -1 && p !== "") {
                    pa.push(p);
                } else if (p === '**') { // 所有子孙目录
                    handled = true;
                    if (i < pathArr.length - 2) {
                        throw new Error('1000');
                    }
                    handleDir(pa.join('/'), pathArr[pathArr.length - 1], true);
                }
            }
            if (!handled) {
                handleDir(pa.join('/'), pathArr[pathArr.length - 1]);
            }

            /**
             * 处理子目录
             * @param dirPath -   目录地址
             * @param fileExt -   文件后缀
             * @param deep -      是否深度处理
             */
            function handleDir(dirPath: string, fileExt: string, deep?: boolean) {
                const dir: Dirent[] = readdirSync(dirPath, {withFileTypes: true});
                const reg: RegExp = toReg(fileExt, 3);
                for (const dirent of dir) {
                    if (dirent.isDirectory()) {
                        if (deep) {
                            handleDir(resolve(dirPath, dirent.name), fileExt, deep);
                        }
                    } else if (dirent.isFile()) {
                        if (reg.test(dirent.name)) {
                            import(resolve(dirPath, dirent.name));
                        }
                    }
                }
            }

            /**
             * 字符串转regexp
             * @param str -       待处理字符串
             * @param side -      两端匹配 1前端 2后端 3两端
             * @returns         转换后的正则表达式
             */
            function toReg(str: string, side?: number): RegExp {
            // 替换/为\/
            str = str.replace(/\//g, '\\/');
            // 替换.为\.
            str = str.replace(/\./g, '\\.');
            // 替换*为.*
            str = str.replace(/\*/g, '.*');
            if (side !== undefined) {
                switch (side) {
                    case 1:
                        str = '^' + str;
                        break;
                    case 2:
                        str = str + '$';
                        break;
                    case 3:
                        str = '^' + str + '$';
                }
            }
            return new RegExp(str);
            }
        }
    }
}
