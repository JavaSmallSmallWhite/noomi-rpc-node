import { InterfaceMethodProxy } from "./proxy/InterfaceMethodProxy";
import { Logger } from "./common/logger/Logger";
import { InterfaceUtil } from "./common/utils/InterfaceUtil";
import { InstanceFactory } from "noomi";
import { Constructor } from "./common/utils/TypesUtil";
import { NoomiRpcError } from "./common/error/NoomiRpcError";

/**
 * 代理对象管理类
 */
export class ReferenceConfig<T> {
  /**
   * 接口对象
   * @private
   */
  private _interfaceRef: Constructor;

  /**
   * 接口方法的代理，一开始就加载
   * @private
   */
  private interfaceMethodProxy: InterfaceMethodProxy<T> = new InterfaceMethodProxy<T>();

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
   * 获取代理对象，所有的操作都通过代理对象去进行
   */
  public get(): T {
    if (!this.serviceName || !this.interfaceRef) {
      throw new NoomiRpcError("未配置服务名称或未配置接口对象");
    }
    const proxy: T = this.interfaceMethodProxy.createProxyForInterface(
      this.interfaceRef,
      this.serviceName
    );
    Logger.info("接口对象" + InterfaceUtil.getInterfaceName(proxy) + "的代理对象创建成功。");
    return proxy;
  }

  /**
   * ----------------------下面是各个成员属性的getter和setter方法-------------------------------
   */
  get interfaceRef(): T {
    return <T>InstanceFactory.getInstance(this._interfaceRef);
  }

  set interfaceRef(value: Constructor) {
    this._interfaceRef = value;
    InstanceFactory.addInstance(value, { singleton: true });
  }

  get serviceName(): string {
    return this._serviceName;
  }

  set serviceName(value: string) {
    this._serviceName = value;
  }

  set servicePrefix(value: string) {
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
    return <NonNullable<unknown>>InstanceFactory.getInstance(this._descriptionClass);
  }

  set descriptionClass(value: Constructor) {
    InstanceFactory.addInstance(value, { singleton: true });
    this._descriptionClass = value;
  }
}
