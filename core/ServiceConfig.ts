import { InstanceFactory } from "noomi";
import { Constructor } from "./common/utils/TypesUtil";

/**
 * 服务配置类
 */
export class ServiceConfig<T> {
  /**
   * 具体的接口实现
   * @private
   */
  private _interfaceProvider: Constructor;

  /**
   * 服务名称
   * @private
   */
  private _serviceName: string;

  /**
   * proto文件路径，使用protobuf序列化时才需要
   * @private
   */
  private _protoFile?: string;

  /**
   * 传输的对象服务名称，使用protobuf序列化时才需要
   * @private
   */
  private _protoServiceName?: string;

  /**
   * fury序列化描述类，使用fury序列化时才需要
   * @private
   */
  private _descriptionClass?: Constructor;

  /**
   * -------------------以下为成员变量的getter和setter------------------------------------
   */

  get interfaceProvider(): T {
    return <T>InstanceFactory.getInstance(this._interfaceProvider);
  }

  set interfaceProvider(value: Constructor) {
    InstanceFactory.addInstance(value, { singleton: true });
    this._interfaceProvider = value;
  }

  get serviceName(): string {
    return this._serviceName;
  }

  set serviceName(value: string) {
    this._serviceName = value;
  }

  get protoFile(): string {
    return this._protoFile;
  }

  set protoFile(value: string) {
    this._protoFile = value;
  }

  get protoServiceName(): string {
    return this._protoServiceName;
  }

  set protoServiceName(value: string) {
    this._protoServiceName = value;
  }

  get descriptionClass(): NonNullable<unknown> {
    return InstanceFactory.getInstance(this._descriptionClass);
  }

  set descriptionClass(value: Constructor) {
    InstanceFactory.addInstance(value, { singleton: true });
    this._descriptionClass = value;
  }
}
