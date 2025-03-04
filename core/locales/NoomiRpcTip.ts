/**
 * tip类型
 */
type TipMessages = {
  [key: string]: string;
};
/**
 * error类型
 */
type ErrorMessages = {
  [key: string]: string;
};
/**
 * model类型
 */
type ModelMessages = {
  int: string;
  float: string;
  number: string;
  string: string;
  boolean: string;
  array: string;
  nullable: string;
  min: string;
  max: string;
  between: string;
  minLength: string;
  maxLength: string;
  betweenLength: string;
  email: string;
  url: string;
  mobile: string;
  idno: string;
  in: string;
  legal: string;
};

/**
 * NoomiRpc提示类型
 */
interface NoomiRpcTip {
  tip: TipMessages;
  error: ErrorMessages;
  model: ModelMessages;
}

/**
 * noomiRpc中文提示信息
 */
export const NoomiRpcTip_zh: NoomiRpcTip = {
  tip: {
    "0100": "启动端口设置成功！端口为：${0}",
    "0101": "国际化语言设置成功！语言为：${0}",
    "0102": "应用名称设置成功！应用名称为：${0}",
    "0103": "日志信息设置成功！使用的日志信息为：${0}",
    "0104": "接口目录设置成功！接口目录为：${0}",
    "0105": "启动目录设置成功！服务前缀为：${0}",
    "0106": "注册中心设置成功！注册中心为：${0}",
    "0107": "负载均衡策略设置成功！负载均衡策略为：${0}",
    "0108": "序列化器设置成功！序列化策略为：${0}",
    "0109": "压缩器设置成功！压缩策略为：${0}",
    "0110": "id发号器设置成功！id发号器为：${0}",
    "0111": "熔断器类型设置成功！熔断器名称为：${0}",
    "0112": "限流器类型设置成功！限流器名称为：${0}",
    "0113": "具体配置解析成功！",

    "0114": "用户未设置${0}注册中心的连接配置，将启用默认的连接配置",
    "0115": "客户端已经连接${0}注册中心成功",
    "0116": "${0}服务的${1}:${2}节点注册成功",
    "0117": "获取${0}下的所有服务节点实例成功。",
    "0118": "服务${0}监听成功。",
    "0119": "根节点${0}，成功创建",
    "0120": "节点${0}已经存在，无需创建",
    "0121": "获取${0}的所有子节点成功。子节点为：${1}",
    "0122": "获取${0}节点数据成功。节点数据为：${1}。",
    "0123": "zookeeper连接关闭成功！",

    "0124": "生成的分布式唯一id为：${0}！",

    "0125": "对字节数组进行进行了压缩，长度由${0}压缩至${1}",
    "0126": "对字节数组进行进行了解压缩，长度由${0}压缩至${1}",
    "0127": "未找到您配置的${0}压缩器，默认选用1号gzip的压缩器",
    "0128": "未找到您配置的编号为${0}压缩器，默认选用1号gzip的压缩器",
    "0129": "不存在您所指定的压缩类型或压缩码，默认选用1号gzip的压缩器",

    "0130": "和${0}服务器的响应时间是：${1}",

    "0131": "hash为${0}的节点已经挂在到了哈希环上",
    "0132": "选取了响应时间为${0}ms的服务节点",
    "0133": "创建NoomiRpc请求成功",
    "0134": "创建NoomiRpc响应成功",

    "0135": "接口对象${0}的${1}方法的代理对象创建成功",

    "0136": "服务${0}，已经被注册",

    "0137": "description反序列化操作完成",
    "0138": "请求体反序列化操作完成",
    "0139": "序列化成功，序列化后的字节数为：${0}",

    "0140": "进程关闭中.....",
    "0141": "进程关闭结束",

    "0142": "请求报文封装成功，请求报文如下：${0}",
    "0143": "开始解析请求报文",
    "0144": "解析id为${0}的请求成功",
    "0145": "请求${0}已经完成方法的调用",
    "0146": "响应报文封装成功，响应报文如下：${0}",
    "0147": "开始解析响应报文",
    "0148": "请求id为${0}的响应反序列化成功",
    "0149": "已寻找到编号为${0}的请求和响应，处理心跳检测，处理结果",
    "0150": "已寻找到编号为${0}的请求和响应，处理结果",
    "0151": "检测到服务${0}有节点上/下线，将重新拉取服务列表...",

    "0152": "tcp服务器关闭",
    "0153": "tcp服务器启动成功，监听服务器地址为：${0}，监听端口为：${1}",
    "0154": "接口对象${0}的代理对象创建成功",
    "0155": "服务调用成功",

    "0156": "使用协议为：${0}"
  },
  //异常消息，前两位表示模块，后两位表示序号
  error: {
    "0000": "未知错误",
    "0001": "空数组不能转换",
    "0002": "未知数据类型：${0}",

    "0100": "读取rpc.json配置文件失败",
    "0101": "解析rpc.json文件内容的配置对象失败",
    "0102": "初始化配置异常！异常信息为：${0}",
    "0103": "接口文件路径：${0}不存在",
    "0104": "接口文件中：${0}不存在",
    "0105": "对象wrapper配置：${0}的配置已存在",
    "0106": "对象wrapper配置：${0}的配置不存在",
    "0107": "未配置服务名称或未配置接口对象",

    "0200": "连接${0}注册中心的配置未配置连接地址",
    "0201": "创建${0}注册中心实例时发生异常，异常信息为：${1}",
    "0202": "${0}服务的${1}:${2}节点注册失败，异常信息为：${3}",
    "0203": "获取${0}服务的节点实例失败，异常信息为：${1}",
    "0204": "服务${0}监听失败，异常信息为：${1}",
    "0205": "创建${0}时发生异常，异常信息为：${1}",
    "0206": "${0}节点判断出现异常，异常信息为：${1}`",
    "0207": "获取${0}节点的子节点发生异常，异常信息为：${1}",
    "0208": "获取${0}节点数据发生异常，异常信息为：${1}",
    "0209": "关闭zookeeper时发生问题，异常信息为：${0}",
    "0210": "未配置服务名称",
    "0211": "${0}服务已存在",

    "0300": "您传入的数据中心编号不合法！",
    "0301": "您输入的机器编号不合法！",
    "0302": "您的服务器进行了时钟回调！",

    "0400": "未获取到本地Ipv4地址！",
    "0401": "和地址为${0}:${1}的主机连接发生异常，正在进行第${2}",
    "0402": "handler处理器类别不合法",
    "0403": "handler处理器不合法",
    "0404": "handler处理链异常",
    "0405": "非法请求",
    "0406": "获得的请求版本不被支持",
    "0407": "非法响应",
    "0408": "获得的请求版本不被支持",
    "0409": "tcp服务器出现异常，异常信息为：${0}",

    "0500": "对字节数组进行压缩时发生异常，异常信息为：${0}",
    "0501": "对字节数组进行解压缩时发生异常，异常信息为：${0}",
    "0502": "编号为${0}的压缩器已存在，请使用其他编号",
    "0503": "压缩名称为${0}的压缩器已存在，请使用其他名称。",

    "0600": "未找到您配置的${0}负载均衡器，默认选用1号RoundRobinLoadBalancer的负载均衡器。",
    "0601": "未找到您配置的编号为${0}负载均衡器，默认选用1号RoundRobinLoadBalancer的负载均衡器。",
    "0602": "不存在该负载均衡类型或负载均衡码，默认选用1号RoundRobinLoadBalancer的负载均衡器。",
    "0603": "编号为${0}的负载均衡器已存在，请使用其他编号。",
    "0604": "名称为${0}的负载均衡器已存在，请使用其他名称。",
    "0605": "进行负载均衡选取节点时发现服务列表为空",
    "0606": "本地没有获取到服务列表",

    "0700": "未找到您配置的${0}熔断器，默认选用SeniorCircuitBreaker熔断器",
    "0701": "熔断器名称为${0}的熔断器器已存在，请使用其他名称",
    "0702": "未找到您配置的${0}限流器，默认选用TokenBuketRateLimiter限流器",
    "0703": "限流器名称为${0}的限流器已存在，请使用其他名称",
    "0704": "当前断路器已经开启，无法发送请求",
    "0705": "对方法${0}进行调用时，重试${1}次，依然不可调用",
    "0706": "在进行第${0}次重试时发生异常。",
    "0707": "服务端被限流",
    "0708": "当前id为${0}的请求，被限流，响应码为：${1}",
    "0709": "当前id为${0}的请求，未找到目标资源，响应码为：${1}",
    "0710": "当前id为${0}的请求，返回错误的结果，响应码为：${1}",
    "0711": "当前id为${0}的请求，访问被拒绝，目标服务器正处于关闭中，响应码为：${1}",

    "0800": "反序列化时传入的Buffer流为空，或者反序列化后指定的目标类为空",
    "0801": "反序列化操作失败， 异常信息为：${0}",
    "0802": "序列化的请求体为空",
    "0803": "序列化操作失败，异常信息为：${0}",
    "0804": "未配置proto文件或对象类型名或方法名或参数返回值标签名",
    "0805": "未找到您配置的${0}序列化器，默认选用1号json的序列化器",
    "0806": "未找到您配置的编号为${0}的序列化器，默认选用1号json的负载均衡器",
    "0807": "不存在您所指定的序列化类型或序列化码，默认选用1号json的序列化器",
    "0808": "编号为${0}的序列化器已存在，请使用其他编号",
    "0809": "序列化名称为${0}的序列化器已存在，请使用其他名称。",

    "0900": "调用服务${0}的方法${1}时发生了异常，异常信息为：${2}"
  },
  //模型消息
  model: {
    //类型消息
    int: "要求整数",
    float: "要求小数",
    number: "要求数字",
    string: "要求字符串",
    boolean: "要求布尔型",
    array: "要求数组",
    //校验消息
    nullable: "不能为空",
    min: "值必须大于等于${0}",
    max: "值必须小于等于${0}",
    between: "值必须在${0}-${1}之间",
    minLength: "长度必须大于等于${0}",
    maxLength: "长度必须小于等于${0}",
    betweenLength: "长度必须在${0}-${1}之间",
    email: "不是有效的email地址",
    url: "不是有效的url地址",
    mobile: "不是有效的移动手机号",
    idno: "不是有效身份证号",
    in: "输入值必须属于数组[${0}]",
    legal: "内容不符合国内法规"
  }
};

/**
 * noomi英文提示信息
 */
export const NoomiRpcTip_en: NoomiRpcTip = {
  tip: {
    "0100": "Startup port set successfully! The port is: ${0}",
    "0101": "Internationalization language set successfully! The language is: ${0}",
    "0102": "Application name set successfully! The application name is: ${0}",
    "0103": "Log information set successfully! The log information used is: ${0}",
    "0104": "Interface directory set successfully! The interface directory is: ${0}",
    "0105": "Startup directory set successfully! The service prefix is: ${0}",
    "0106": "Registry center set successfully! The registry center is: ${0}",
    "0107": "Load balancing strategy set successfully! The load balancing strategy is: ${0}",
    "0108": "Serializer set successfully! The serialization strategy is: ${0}",
    "0109": "Compressor set successfully! The compression strategy is: ${0}",
    "0110": "ID generator set successfully! The ID generator is: ${0}",
    "0111": "Circuit breaker type set successfully! The circuit breaker name is: ${0}",
    "0112": "Rate limiter type set successfully! The rate limiter name is: ${0}",
    "0113": "Specific configuration parsing succeeded!",

    "0114":
      "User did not set the ${0} registry center connection configuration, default connection configuration will be used",
    "0115": "Client successfully connected to the ${0} registry center",
    "0116": "${0} service's ${1}:${2} node registered successfully",
    "0117": "Successfully retrieved all service node instances under ${0}.",
    "0118": "Service ${0} is now listening.",
    "0119": "Root node ${0} created successfully.",
    "0120": "Node ${0} already exists, no need to create",
    "0121": "Successfully retrieved all child nodes under ${0}. Child nodes are: ${1}",
    "0122": "Successfully retrieved node data for ${0}. Node data is: ${1}.",
    "0123": "Zookeeper connection closed successfully!",

    "0124": "Generated distributed unique ID: ${0}!",

    "0125": "Byte array was compressed, length reduced from ${0} to ${1}",
    "0126": "Byte array was decompressed, length reduced from ${0} to ${1}",
    "0127": "Could not find the ${0} compressor you configured, defaulting to compressor 1 (gzip)",
    "0128":
      "Could not find the compressor with ID ${0} you configured, defaulting to compressor 1 (gzip)",
    "0129":
      "The specified compression type or compression code does not exist, defaulting to compressor 1 (gzip)",

    "0130": "The response time with ${0} server.js is: ${1}",

    "0131": "Node with hash ${0} has been added to the hash ring",
    "0132": "Service node with response time ${0}ms has been selected",
    "0133": "NoomiRpc request created successfully",
    "0134": "NoomiRpc response created successfully",

    "0135": "Proxy object for method ${1} of interface object ${0} created successfully",

    "0136": "Service ${0} is already registered",

    "0137": "Description deserialization completed",
    "0138": "Request body deserialization completed",
    "0139": "Serialization successful, serialized byte count: ${0}",

    "0140": "Process closing....",
    "0141": "Process closed",

    "0142": "Request message packaged successfully, the request message is: ${0}",
    "0143": "Started parsing request message",
    "0144": "Request with ID ${0} parsed successfully",
    "0145": "Request ${0} has completed method invocation",
    "0146": "Response message packaged successfully, the response message is: ${0}",
    "0147": "Started parsing response message",
    "0148": "Response deserialization for request with ID ${0} completed successfully",
    "0149":
      "Found request and response with ID ${0}, processing heartbeat detection, result processed",
    "0150": "Found request and response with ID ${0}, processing result",
    "0151": "Detected node up/down for service ${0}, will pull the service list again...",

    "0152": "TCP server.js closed",
    "0153": "TCP server.js started successfully, listening on address: ${0}, port: ${1}",
    "0154": "Proxy object for interface object ${0} created successfully"
  },
  // Error messages, the first two digits represent module, the last two digits represent sequence
  error: {
    "0000": "Unknown error",
    "0001": "Empty array cannot be converted",
    "0002": "Unknown data type: ${0}",

    "0100": "Failed to read rpc.json configuration file",
    "0101": "Failed to parse rpc.json file content to configuration object",
    "0102": "Configuration initialization exception! Exception message: ${0}",
    "0103": "Interface file path: ${0} does not exist",
    "0104": "Interface file: ${0} does not exist",
    "0105": "Object wrapper configuration: ${0} already exists",
    "0106": "Object wrapper configuration: ${0} does not exist",
    "0107": "Service name not configured or interface object not configured",

    "0200": "Connection address for ${0} registry center is not configured",
    "0201":
      "Exception occurred while creating ${0} registry center instance, exception message: ${1}",
    "0202": "Registration failed for ${0} service's ${1}:${2} node, exception message: ${3}",
    "0203": "Failed to retrieve ${0} service node instances, exception message: ${1}",
    "0204": "Service ${0} listen failed, exception message: ${1}",
    "0205": "Exception occurred while creating ${0}, exception message: ${1}",
    "0206": "Exception occurred while judging ${0} node, exception message: ${1}",
    "0207": "Exception occurred while retrieving ${0} node's child nodes, exception message: ${1}",
    "0208": "Exception occurred while retrieving ${0} node data, exception message: ${1}",
    "0209": "Exception occurred while closing zookeeper, exception message: ${0}",
    "0210": "Service name not configured",
    "0211": "${0} service already exists",

    "0300": "Invalid data center ID passed in!",
    "0301": "Invalid machine ID entered!",
    "0302": "Your server.js performed a clock rollback!",

    "0400": "Could not retrieve local IPv4 address!",
    "0401": "Exception occurred while connecting to host at ${0}:${1}, retrying ${2} times",
    "0402": "Handler processor type is invalid",
    "0403": "Handler processor is invalid",
    "0404": "Handler processing chain exception",
    "0405": "Illegal request",
    "0406": "Received request version is not supported",
    "0407": "Illegal response",
    "0408": "Received response version is not supported",
    "0409": "TCP server.js exception, exception message: ${0}",

    "0500": "Exception occurred while compressing byte array, exception message: ${0}",
    "0501": "Exception occurred while decompressing byte array, exception message: ${0}",
    "0502": "Compressor with ID ${0} already exists, please use a different ID",
    "0503": "Compressor with name ${0} already exists, please use a different name.",

    "0600":
      "Could not find the ${0} load balancer you configured, defaulting to load balancer 1 (RoundRobinLoadBalancer).",
    "0601":
      "Could not find the load balancer with ID ${0} you configured, defaulting to load balancer 1 (RoundRobinLoadBalancer).",
    "0602":
      "The specified load balancing type or load balancing code does not exist, defaulting to load balancer 1 (RoundRobinLoadBalancer).",
    "0603": "Load balancer with ID ${0} already exists, please use a different ID.",
    "0604": "Load balancer with name ${0} already exists, please use a different name.",
    "0605": "Found empty service list when selecting node for load balancing",
    "0606": "No service list retrieved locally",

    "0700":
      "Could not find the ${0} circuit breaker you configured, defaulting to SeniorCircuitBreaker circuit breaker",
    "0701": "Circuit breaker with name ${0} already exists, please use a different name",
    "0702":
      "Could not find the ${0} rate limiter you configured, defaulting to TokenBucketRateLimiter rate limiter",
    "0703": "Rate limiter with name ${0} already exists, please use a different name",
    "0704": "Circuit breaker is already open, cannot send request",
    "0705": "Call failed after ${1} retries for method ${0}",
    "0706": "Exception occurred during retry ${0}.",
    "0707": "Server limited the request",
    "0708": "Request with ID ${0} limited, response code: ${1}",
    "0709": "Request with ID ${0} not found, response code: ${1}",
    "0710": "Request with ID ${0} returned error, response code: ${1}",
    "0711": "Request with ID ${0} was denied, target server.js is shut down, response code: ${1}",

    "0800":
      "Buffer stream passed in for deserialization is empty, or target class for deserialization is empty",
    "0801": "Deserialization failed, exception message: ${0}",
    "0802": "Serialized request body is empty",
    "0803": "Serialization failed, exception message: ${0}",
    "0804":
      "Proto file, object type name, method name, or parameter return value label name not configured",
    "0805": "Could not find the ${0} serializer you configured, defaulting to serializer 1 (json)",
    "0806":
      "Could not find the serializer with ID ${0} you configured, defaulting to serializer 1 (json)",
    "0807":
      "The specified serialization type or serialization code does not exist, defaulting to serializer 1 (json)",
    "0808": "Serializer with ID ${0} already exists, please use a different ID",
    "0809": "Serializer with name ${0} already exists, please use a different name.",

    "0900": "Exception occurred while calling method ${1} of service ${0}, exception message: ${2}"
  },
  //模型消息
  model: {
    //类型消息
    int: "Need input integer",
    float: "Need input float",
    number: "Need input number",
    string: "Need input string",
    boolean: "Need input boolean",
    array: "Need input array",
    //校验消息
    nullable: "Not allow empty",
    min: "Value must >= ${0}",
    max: "Value must <= ${0}",
    between: "Value must between ${0} and ${1}",
    minLength: "Value length must >= ${0}",
    maxLength: "Value length must <= ${0}",
    betweenLength: "Value length must between ${0} and ${1}",
    email: "Value is not a valid email",
    url: "Value is not a valid url",
    mobile: "Value is not a valid mobile no",
    idno: "Value is not a valid ID No",
    in: "Value must belong to array[${0}]",
    legal: "Value is illegal"
  }
};
