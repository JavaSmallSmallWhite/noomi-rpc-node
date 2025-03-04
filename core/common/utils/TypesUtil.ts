/**
 * net
 */
export type Socket = import("net").Socket;

/**
 * async_hooks
 */
export type AsyncLocalStorage<T> = import("async_hooks").AsyncLocalStorage<T>;

/**
 * nacos
 */
export type NacosNamingClient = import("nacos").NacosNamingClient;
export type NacosNamingClientConfig = import("nacos").NacosNamingClientConfig;
export type Instance = import("nacos").Instance;
export type Host = import("nacos").Host;
export type SubscribeInfo = import("nacos").SubscribeInfo;
export type Hosts = import("nacos").Hosts;

/**
 * zookeeper
 */
export type Zookeeper = import("node-zookeeper-client").Client;
export type Option = import("node-zookeeper-client").Option;
export type Exception = import("node-zookeeper-client").Exception;
export type Stat = import("node-zookeeper-client").Stat;
export type Event = import("node-zookeeper-client").Event;

/**
 * consul
 */
export type ConsulOptions = import("consul").ConsulOptions;
export type RegisterOptions = import("consul").Agent.Service.RegisterOptions;
export type ConsulConnection = import("consul").Consul;

/**
 * fury
 */
export type Hps = import("@furyjs/fury/dist/lib/type").Hps;
export type Fury = import("@furyjs/fury").default;
export type TypeDescription = import("@furyjs/fury").TypeDescription;
export type InternalSerializerType = import("@furyjs/fury").InternalSerializerType;
/**
 * log4js
 */
export type Log = import("log4js").Logger;
export type Config = import("log4js").Configuration;

/**
 * protobuf
 */
export type Type = import("protobufjs").Type;
export type Root = import("protobufjs").Root;

/**
 * typescript
 */
export type ClassElement = import("typescript").ClassElement;
export type InterfaceDeclaration = import("typescript").InterfaceDeclaration;
export type ClassDeclaration = import("typescript").ClassDeclaration;

// 类
export type Constructor = new (...args: unknown[]) => void;

// noomi
export type FilterOption = import("noomi").FilterOption;

// http2
export type Http2ServerRequest = import("http2").Http2ServerRequest;
export type Http2ServerResponse = import("http2").Http2ServerResponse;
