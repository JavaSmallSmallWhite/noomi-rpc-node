/**
 * zookeeper节点配置
 */
export class ZookeeperNode {
  private _nodePath: string;
  private _data: Buffer;

  public get nodePath(): string {
    return this._nodePath;
  }

  public set nodePath(value: string) {
    this._nodePath = value;
  }

  public get data(): Buffer {
    return this._data;
  }

  public set data(value: Buffer) {
    this._data = value;
  }

  public constructor(nodePath: string, data: Buffer) {
    this._nodePath = nodePath;
    this._data = data;
  }
}
