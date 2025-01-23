import { Application } from "./ApplicationUtil";
import { ClassElement, Constructor, InterfaceDeclaration, ClassDeclaration } from "./TypesUtil";
import { NoomiRpcStarter } from "../../NoomiRpcStarter";
import { Util } from "noomi";
import { NoomiRpcError } from "../error/NoomiRpcError";

/**
 * 服务工具类
 */
export class InterfaceUtil {
  /**
   * 获取实例对象的接口名
   * @param interfaceObj 接口的实例对象
   */
  public static getInterfaceName(interfaceObj: NonNullable<unknown>): string {
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
  public static getInterfaceMethodsName(interfaceObj: NonNullable<unknown>): Array<string> {
    const prototype = Reflect.getPrototypeOf(interfaceObj);
    const propertyNames = Reflect.ownKeys(prototype);
    return <Array<string>>(
      propertyNames.filter(
        (methodName) =>
          methodName !== "constructor" && typeof interfaceObj[methodName] === "function"
      )
    );
  }

  /**
   * 生成接口的代理实现类
   * @param name 接口文件名称
   * @param interfaceName 接口名称
   */
  public static genInterfaceClass(name: string, interfaceName: string): Constructor {
    // 获取文件的绝对路径并读取代码
    const apiDir = NoomiRpcStarter.getInstance().getConfiguration().apiDir;
    const interfacePaths = Array.isArray(apiDir) ? apiDir : [apiDir];
    const interfacePath = Util.getAbsPath(interfacePaths.concat([name]));

    if (!Application.fs.existsSync(interfacePath)) {
      throw new NoomiRpcError("0103", interfacePath);
    }

    const interfaceCode = Application.fs.readFileSync(interfacePath, "utf-8");

    // 使用 TypeScript 创建源文件的 AST
    const astTree = Application.typescript.createSourceFile(
      "temp.ts",
      interfaceCode,
      Application.typescript.ScriptTarget.Latest,
      true
    );

    // 处理接口的逻辑：创建代理类
    const createProxyClass = (interfaceNode: InterfaceDeclaration) => {
      const classElements: ClassElement[] = [];
      const { factory } = Application.typescript;

      // 遍历接口中的方法，生成代理类的相应方法
      interfaceNode.members.forEach((member) => {
        if (Application.typescript.isMethodSignature(member)) {
          const methodName = member.name.getText(astTree);
          const params = member.parameters.map((param) =>
            factory.createParameterDeclaration(
              undefined, // 修饰符
              undefined, // 可变参数
              param.name, // 参数名
              undefined, // 可选标记
              undefined, // 参数类型
              undefined // 初始化器
            )
          );

          // 生成代理方法体，抛出未实现的错误
          const methodBody = factory.createBlock(
            [
              factory.createThrowStatement(
                factory.createNewExpression(factory.createIdentifier("Error"), undefined, [
                  factory.createStringLiteral(`Method ${methodName} not implemented`)
                ])
              )
            ],
            true
          );

          // 创建代理方法
          const proxyMethod = factory.createMethodDeclaration(
            undefined, // 修饰符
            undefined, // 星号
            factory.createIdentifier(methodName), // 方法名
            undefined, // 可选标记
            undefined, // 类型参数
            params, // 参数
            undefined, // 返回类型
            methodBody // 方法体
          );

          classElements.push(proxyMethod);
        }
      });

      // 返回代理类的节点
      return factory.createClassDeclaration(
        undefined, // 修饰符
        factory.createIdentifier(interfaceName), // 类名
        undefined, // 类型参数
        undefined, // 继承
        classElements // 类成员
      );
    };

    // 遍历 AST，找到目标接口并生成代理类
    let proxyClassNode: ClassDeclaration | null = null;
    Application.typescript.forEachChild(astTree, (node) => {
      if (Application.typescript.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
        proxyClassNode = createProxyClass(node);
      }
    });

    // 如果未找到目标接口，抛出错误
    if (!proxyClassNode) {
      throw new NoomiRpcError("0104", interfaceName);
    }

    // 使用打印器将生成的代理类转换为 TypeScript 代码
    const printer = Application.typescript.createPrinter({
      newLine: Application.typescript.NewLineKind.LineFeed
    });

    const result = printer.printNode(
      Application.typescript.EmitHint.Unspecified,
      proxyClassNode,
      astTree
    );

    // 返回生成的代理类代码
    return new Function(`return ${result};`)();
  }

  /**
   * 执行一个函数
   * @param func 函数
   * @param args 参数
   */
  public static executeFunction(
    func: (...args: unknown[]) => unknown,
    ...args: unknown[]
  ): unknown {
    if (func) {
      return func(...args);
    }
    return args[0];
  }
  // /**
  //  * 生成接口的对象
  //  * @param path 接口路径
  //  * @param interfaceName 接口名
  //  */
  // public static genInterfaceObject<T>(path: string, interfaceName: string): T {
  //   // TypeScript 编译选项
  //   const compilerOptions: CompilerOptions = {
  //     target: Application.typescript.ScriptTarget.ESNext,
  //     module: Application.typescript.ModuleKind.CommonJS
  //   };
  //
  //   // 创建 TypeScript 语言服务
  //   const program = Application.typescript.createProgram([path], compilerOptions);
  //   const checker = program.getTypeChecker();
  //
  //   // 解析源代码，生成节点
  //   const sourceFile = program.getSourceFile(path);
  //   if (!sourceFile) {
  //     throw new Error("aa");
  //   }
  //   const interfaces = this.parseNode(sourceFile, checker);
  //
  //   // 生成接口对应类字符串
  //   const interfaceClassArray: Array<{ name: string; classString: string }> =
  //     this.genInterfaceClassArray(interfaces);
  //   const interfaceClass = interfaceClassArray.find((value) => value.name === interfaceName);
  //   if (!interfaceClass) {
  //     throw new Error("aa");
  //   }
  //   const func = new Function(interfaceClass.classString);
  //   return <T>func();
  // }
  //
  // /**
  //  * 生成代理类字符串
  //  * @param interfaces 接口对象数组
  //  * @private
  //  */
  // private static genInterfaceClassArray(
  //   interfaces: Array<InterfaceObject>
  // ): Array<{ name: string; classString: string }> {
  //   const interfaceClassArray: Array<{ name: string; classString: string }> = [];
  //   interfaces.forEach((item) => {
  //     let fieldsStr = "";
  //     item.fields.forEach((field) => (fieldsStr += field + ";"));
  //     let methodsStr = "";
  //     item.methods.forEach(
  //       (method) => (methodsStr += method + ' {throw new Error("Method not implemented.");}')
  //     );
  //     const str = `
  //                   return class ${item.interfaceName} {
  //
  //                       ${fieldsStr}
  //
  //                       ${methodsStr}
  //                   }
  //           `;
  //     interfaceClassArray.push({ name: item.interfaceName, classString: str });
  //   });
  //   return interfaceClassArray;
  // }
  //
  // /**
  //  * 解析ts文本节点
  //  * @param node 文本节点
  //  * @param checker 类型检查器
  //  * @private
  //  */
  // private static parseNode(node: Node, checker: TypeChecker): Array<InterfaceObject> {
  //   const interfaces: Array<InterfaceObject> = [];
  //   parseNode(node);
  //   return interfaces;
  //
  //   function parseNode(node: Node): void {
  //     if (Application.typescript.isInterfaceDeclaration(node)) {
  //       const interfaceName = node.name.text;
  //
  //       // 获取接口的字段和方法
  //       const fields: string[] = [];
  //       const methods: string[] = [];
  //
  //       node.members.forEach((member) => {
  //         if (Application.typescript.isPropertySignature(member)) {
  //           const fieldName = member.name.getText();
  //           fields.push(fieldName);
  //         } else if (Application.typescript.isMethodSignature(member)) {
  //           const methodName = member.name.getText();
  //           const methodParams = member.parameters
  //             .map((param) => {
  //               return param.name.getText();
  //             })
  //             .join(", ");
  //           methods.push(`${methodName}(${methodParams})`);
  //         }
  //       });
  //
  //       interfaces.push({
  //         interfaceName,
  //         fields,
  //         methods
  //       });
  //     }
  //
  //     Application.typescript.forEachChild(node, parseNode);
  //   }
  // }

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
      const pathArr: string[] = path.split("/");
      const pa: string[] = [basePath];
      let handled: boolean = false; // 是否已处理
      for (let i = 0; i < pathArr.length - 1; i++) {
        const p: string = pathArr[i];
        if (p.indexOf("*") === -1 && p !== "") {
          pa.push(p);
        } else if (p === "**") {
          // 所有子孙目录
          handled = true;
          if (i < pathArr.length - 2) {
            throw new Error("1000");
          }
          handleDir(pa.join("/"), pathArr[pathArr.length - 1], true);
        }
      }
      if (!handled) {
        handleDir(pa.join("/"), pathArr[pathArr.length - 1]);
      }

      /**
       * 处理子目录
       * @param dirPath -   目录地址
       * @param fileExt -   文件后缀
       * @param deep -      是否深度处理
       */
      function handleDir(dirPath: string, fileExt: string, deep?: boolean) {
        const dir = Application.fs.readdirSync(dirPath, { withFileTypes: true });
        const reg = toReg(fileExt, 3);
        for (const dirent of dir) {
          if (dirent.isDirectory()) {
            if (deep) {
              handleDir(Application.path.resolve(dirPath, dirent.name), fileExt, deep);
            }
          } else if (dirent.isFile()) {
            if (reg.test(dirent.name)) {
              import(Application.path.resolve(dirPath, dirent.name));
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
        str = str.replace(/\//g, "\\/");
        // 替换.为\.
        str = str.replace(/\./g, "\\.");
        // 替换*为.*
        str = str.replace(/\*/g, ".*");
        if (side !== undefined) {
          switch (side) {
            case 1:
              str = "^" + str;
              break;
            case 2:
              str = str + "$";
              break;
            case 3:
              str = "^" + str + "$";
          }
        }
        return new RegExp(str);
      }
    }
  }
}
