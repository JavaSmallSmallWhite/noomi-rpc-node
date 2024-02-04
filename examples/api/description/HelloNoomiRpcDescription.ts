import {Type} from "@furyjs/fury";
import {Description} from "../../../core/ServiceConfig";

/**
 * HelloNoomiRpc的接口描述
 */
export class HelloNoomiRpcDescription {

    /**
     * sayHi方法的描述
     * 方法描述必须以的函数名必须以Description结尾
     */
    public sayHiDescription(): Description {
        return {
            // 参数描述，用Type.array()报告每个参数类型
            argumentsDescription: Type.array(Type.string()),
            // 返回值描述
            returnValueDescription: Type.string()
        };
    }

    /**
     * sayHi方法的描述
     * 方法描述必须以的函数名必须以Description结尾
     */
    public sayHelloDescription(): Description {
        return {
            argumentsDescription: Type.array(Type.string()),
            returnValueDescription: Type.string()
        };
    }
}
