import {SerializerOption} from "../../serialize/SerializerTypes";
import {SerializerFactory} from "../../serialize/SerializerFactory";
import {ObjectWrapper} from "../../configuration/ObjectWrapper";
import {Serializer} from "../../serialize/Serializer";
import {Starter} from "../../index";

/**
 * 序列化装饰器，用于添加自定义的序列化器，装饰类
 * @constructor
 */
export function CustomSerializer(serializerOption: SerializerOption): (target: Function) => void {
    return (target: Function): void => {
        const serializerName: string = serializerOption["serializerName"] || target.name
        SerializerFactory.addLoadBalancer(
            new ObjectWrapper<Serializer>(
                serializerOption["serializerId"],
                serializerName,
                Reflect.construct(target, [])
            )
        );
        if (serializerOption["isUse"]) {
            Starter.getInstance().getConfiguration().loadBalancerType = serializerName;
        }
    }
}
