/**
 * 包类
 */
export class Application {
  /**
   * fs
   * @private
   */
  static #fs: typeof import("fs") | undefined;

  /**
   * net
   * @private
   */
  static #net: typeof import("net") | undefined;

  /**
   * url
   * @private
   */
  static #url: typeof import("url") | undefined;

  /**
   * path
   * @private
   */
  static #path: typeof import("path") | undefined;

  /**
   * os
   * @private
   */
  static #os: typeof import("os") | undefined;

  /**
   * http2
   * @private
   */
  static #http2: typeof import("http2") | undefined;

  /**
   * zlib
   * @private
   */
  static #zlib: typeof import("zlib") | undefined;

  /**
   * crypto
   * @private
   */
  static #crypto: typeof import("crypto") | undefined;

  /**
   * async#hooks
   * @private
   */
  static #asyncHooks: typeof import("async_hooks") | undefined;

  /**
   * json5
   * @private
   */
  static #json5: typeof import("json5") | undefined;

  /**
   * nacos
   * @private
   */
  static #nacos: typeof import("nacos") | undefined;

  /**
   * zookeeper
   * @private
   */
  static #zookeeper: typeof import("node-zookeeper-client") | undefined;

  /**
   * consul
   * @private
   */
  static #consul: typeof import("consul") | undefined;

  /**
   * etcd3
   * @private
   */
  static #etcd3: typeof import("etcd3") | undefined;

  /**
   * fury
   * @private
   */
  static #fury: typeof import("@furyjs/fury") | undefined;

  /**
   * log4js
   * @private
   */
  static #log4js: typeof import("log4js") | undefined;

  /**
   * protobuf
   * @private
   */
  static #protobuf: typeof import("protobufjs") | undefined;

  /**
   * msgpack
   * @private
   */
  static #msgpack: typeof import("msgpackr") | undefined;

  /**
   * typescript
   * @private
   */
  static #typescript: typeof import("typescript") | undefined;

  /**
   * events
   * @private
   */
  static #events: typeof import("events") | undefined;
  /**
   * fs
   */
  public static get fs() {
    if (!this.#fs) {
      this.#fs = require("fs");
    }
    return this.#fs;
  }

  /**
   * net
   */
  public static get net() {
    if (!this.#net) {
      this.#net = require("net");
    }
    return this.#net;
  }

  /**
   * net
   */
  public static get url() {
    if (!this.#url) {
      this.#url = require("url");
    }
    return this.#url;
  }

  /**
   * path
   */
  public static get path() {
    if (!this.#path) {
      this.#path = require("path");
    }
    return this.#path;
  }

  /**
   * os
   */
  public static get os() {
    if (!this.#os) {
      this.#os = require("os");
    }
    return this.#os;
  }

  /**
   * http2
   */
  public static get http2() {
    if (!this.#http2) {
      this.#http2 = require("http2");
    }
    return this.#http2;
  }

  /**
   * zlib
   */
  public static get zlib() {
    if (!this.#zlib) {
      this.#zlib = require("zlib");
    }
    return this.#zlib;
  }

  /**
   * crypto
   */
  public static get crypto() {
    if (!this.#crypto) {
      this.#crypto = require("crypto");
    }
    return this.#crypto;
  }

  /**
   * http2
   */
  public static get asyncHooks() {
    if (!this.#asyncHooks) {
      this.#asyncHooks = require("async#hooks");
    }
    return this.#asyncHooks;
  }

  /**
   * json5
   */
  public static get json5() {
    if (!this.#json5) {
      this.#json5 = require("json5");
    }
    return this.#json5;
  }

  /**
   * nacos
   */
  public static get nacos() {
    if (!this.#nacos) {
      this.#nacos = require("nacos");
    }
    return this.#nacos;
  }

  /**
   * zookeeper
   */
  public static get zookeeper() {
    if (!this.#zookeeper) {
      this.#zookeeper = require("node-zookeeper-client");
    }
    return this.#zookeeper;
  }

  /**
   * consul
   */
  public static get consul() {
    if (!this.#consul) {
      this.#consul = require("consul");
    }
    return this.#consul;
  }

  /**
   * etcd3
   */
  public static get etcd3() {
    if (!this.#etcd3) {
      this.#etcd3 = require("etcd3");
    }
    return this.#etcd3;
  }

  /**
   * fury
   */
  public static get fury() {
    if (!this.#fury) {
      this.#fury = require("@furyjs/fury");
    }
    return this.#fury;
  }

  /**
   * log4js
   */
  public static get log4js() {
    if (!this.#log4js) {
      this.#log4js = require("log4js");
    }
    return this.#log4js;
  }

  /**
   * protobuf
   */
  public static get protobuf() {
    if (!this.#protobuf) {
      this.#protobuf = require("protobufjs");
    }
    return this.#protobuf;
  }

  /**
   * msgpack
   */
  public static get msgpack() {
    if (!this.#msgpack) {
      this.#msgpack = require("msgpackr");
    }
    return this.#msgpack;
  }

  /**
   * typescript
   */
  public static get typescript() {
    if (!this.#typescript) {
      this.#typescript = require("typescript");
    }
    return this.#typescript;
  }

  /**
   * events
   */
  public static get events() {
    if (!this.#events) {
      this.#events = require("events");
    }
    return this.#events;
  }
}
