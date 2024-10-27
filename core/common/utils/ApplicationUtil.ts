/**
 * 包类
 */
export class Application {
  /**
   * fs
   * @private
   */
  private static _fs: typeof import("fs") | undefined;

  /**
   * net
   * @private
   */
  private static _net: typeof import("net") | undefined;

  /**
   * url
   * @private
   */
  private static _url: typeof import("url") | undefined;

  /**
   * path
   * @private
   */
  private static _path: typeof import("path") | undefined;

  /**
   * os
   * @private
   */
  private static _os: typeof import("os") | undefined;

  /**
   * http2
   * @private
   */
  private static _http2: typeof import("http2") | undefined;

  /**
   * zlib
   * @private
   */
  private static _zlib: typeof import("zlib") | undefined;

  /**
   * crypto
   * @private
   */
  private static _crypto: typeof import("crypto") | undefined;

  /**
   * async_hooks
   * @private
   */
  private static _asyncHooks: typeof import("async_hooks") | undefined;

  /**
   * json5
   * @private
   */
  private static _json5: typeof import("json5") | undefined;

  /**
   * nacos
   * @private
   */
  private static _nacos: typeof import("nacos") | undefined;

  /**
   * zookeeper
   * @private
   */
  private static _zookeeper: typeof import("node-zookeeper-client") | undefined;

  /**
   * consul
   * @private
   */
  private static _consul: typeof import("consul") | undefined;

  /**
   * etcd3
   * @private
   */
  private static _etcd3: typeof import("etcd3") | undefined;

  /**
   * fury
   * @private
   */
  private static _fury: typeof import("@furyjs/fury") | undefined;

  /**
   * log4js
   * @private
   */
  private static _log4js: typeof import("log4js") | undefined;

  /**
   * protobuf
   * @private
   */
  private static _protobuf: typeof import("protobufjs") | undefined;

  /**
   * msgpack
   * @private
   */
  private static _msgpack: typeof import("msgpackr") | undefined;

  /**
   * typescript
   * @private
   */
  private static _typescript: typeof import("typescript") | undefined;

  /**
   * fs
   */
  public static get fs() {
    if (!this._fs) {
      this._fs = require("fs");
    }
    return this._fs;
  }

  /**
   * net
   */
  public static get net() {
    if (!this._net) {
      this._net = require("net");
    }
    return this._net;
  }

  /**
   * net
   */
  public static get url() {
    if (!this._url) {
      this._url = require("url");
    }
    return this._url;
  }

  /**
   * path
   */
  public static get path() {
    if (!this._path) {
      this._path = require("path");
    }
    return this._path;
  }

  /**
   * os
   */
  public static get os() {
    if (!this._os) {
      this._os = require("os");
    }
    return this._os;
  }

  /**
   * http2
   */
  public static get http2() {
    if (!this._http2) {
      this._http2 = require("http2");
    }
    return this._http2;
  }

  /**
   * zlib
   */
  public static get zlib() {
    if (!this._zlib) {
      this._zlib = require("zlib");
    }
    return this._zlib;
  }

  /**
   * crypto
   */
  public static get crypto() {
    if (!this._crypto) {
      this._crypto = require("crypto");
    }
    return this._crypto;
  }

  /**
   * http2
   */
  public static get asyncHooks() {
    if (!this._asyncHooks) {
      this._asyncHooks = require("async_hooks");
    }
    return this._asyncHooks;
  }

  /**
   * json5
   */
  public static get json5() {
    if (!this._json5) {
      this._json5 = require("json5");
    }
    return this._json5;
  }

  /**
   * nacos
   */
  public static get nacos() {
    if (!this._nacos) {
      this._nacos = require("nacos");
    }
    return this._nacos;
  }

  /**
   * zookeeper
   */
  public static get zookeeper() {
    if (!this._zookeeper) {
      this._zookeeper = require("node-zookeeper-client");
    }
    return this._zookeeper;
  }

  /**
   * consul
   */
  public static get consul() {
    if (!this._consul) {
      this._consul = require("consul");
    }
    return this._consul;
  }

  /**
   * etcd3
   */
  public static get etcd3() {
    if (!this._etcd3) {
      this._etcd3 = require("etcd3");
    }
    return this._etcd3;
  }

  /**
   * fury
   */
  public static get fury() {
    if (!this._fury) {
      this._fury = require("@furyjs/fury");
    }
    return this._fury;
  }

  /**
   * log4js
   */
  public static get log4js() {
    if (!this._log4js) {
      this._log4js = require("log4js");
    }
    return this._log4js;
  }

  /**
   * protobuf
   */
  public static get protobuf() {
    if (!this._protobuf) {
      this._protobuf = require("protobufjs");
    }
    return this._protobuf;
  }

  /**
   * msgpack
   */
  public static get msgpack() {
    if (!this._msgpack) {
      this._msgpack = require("msgpackr");
    }
    return this._msgpack;
  }

  /**
   * typescript
   */
  public static get typescript() {
    if (!this._typescript) {
      this._typescript = require("typescript");
    }
    return this._typescript;
  }
}
