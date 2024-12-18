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

    "0135": "接口对象${0}的${1}方法的代理对象创建成功。",

    "0136": "服务${0}，已经被注册。"
  },
  //异常消息，前两位表示模块，后两位表示序号
  error: {
    "0000": "未知错误",

    "0100": "读取rpc.json配置文件失败",
    "0101": "解析rpc.json文件内容的配置对象失败",
    "0102": "初始化配置异常！异常信息为：${0}",
    "0103": "接口文件路径：${0}不存在",
    "0104": "接口文件中：${0}不存在",
    "0105": "对象wrapper配置：${0}的配置已存在",
    "0106": "对象wrapper配置：${0}的配置不存在",

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

    "0300": "您传入的数据中心编号不合法！",
    "0301": "您输入的机器编号不合法！",
    "0302": "您的服务器进行了时钟回调！",

    "0400": "未获取到本地Ipv4地址！",
    "0401": "和地址为${0}:${1}的主机连接发生异常，正在进行第${2",

    "0500": "对字节数组进行压缩时发生异常，异常信息为：${0}",
    "0501": "对字节数组进行解压缩时发生异常，异常信息为：${0}",
    "0502": "编号为${0}的压缩器已存在，请使用其他编号",
    "0503": "压缩名称为${0}的压缩器已存在，请使用其他名称。",

    "0600": "未找到您配置的${0}负载均衡器，默认选用1号RoundRobinLoadBalancer的负载均衡器。",
    "0601": "未找到您配置的编号为${0}负载均衡器，默认选用1号RoundRobinLoadBalancer的负载均衡器。",
    "0602":
      "不存在您所指定的负载均衡类型或负载均衡码，默认选用1号RoundRobinLoadBalancer的负载均衡器。",
    "0603": "编号为${0}的负载均衡器已存在，请使用其他编号。",
    "0604": "名称为${0}的负载均衡器已存在，请使用其他名称。",
    "0605": "进行负载均衡选取节点时发现服务列表为空",
    "0606": "本地没有获取到服务列表"
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
    "0100": "Noomi is booting ...",
    "0101": "redis initing ...",
    "0102": "redis inition finished",
    "0103": "web initing ...",
    "0104": "web inition finished",
    "0105": "instance factory initing ...",
    "0106": "instance factory inition finished!",
    "0107": "filter initing...",
    "0108": "filter inition finished",
    "0109": "route factory initing ...",
    "0110": "route factory inition finished",
    "0111": "datasource initing ...",
    "0112": "datasource inition finished",
    "0113": "aop initing ...",
    "0114": "aop inition finished",
    "0115": "security initing ...",
    "0116": "security inition finished",
    "0117": "Noomi is started!",
    "0118": "address is in used，trying again ...",
    "0119": "check and execute launch hooks ...",
    "0120": "launch hooks execution finished!",
    "0121": "Http Server is running,listening port ${0}",
    "0122": "Https Server is running,listening port ${0}"
  },
  //异常消息
  error: {
    "0000": "unknown error",
    "0001": "Error in configuration process,noomi.ini may be invalid",
    "0050": "file is not exist",
    "0100": "Error in exception configuration file,Please read the official documentation!",
    "0500": "Error in web configuration file,Please read the official documentation!",
    "0501": "upload file is oversize",
    "0502": "form submit without boundary",
    "0600": "Lack of redis config!",

    "1000": "Error in instance configuration file,Please read the official documentation!",
    "1001": "Instance '${0}' does not exist",
    "1002": "Instance '${0}' already exists，it cannot be defined repatedly",
    "1003": "Module must be defined as class",
    "1004": "Module path '${0}' does not exist",
    "1010": "Instance method '${0}' does not exist",
    "1011": "instance decorator params are wrong",

    "2000": "Error in aop configuration file,Please read the official documentation!",
    "2001": "Error in expressions parameter configuration of pointcut",
    "2002": "pointcut '${0}' does not exist",
    "2003": "pointcut '${0}' already exists，it cannot be defined repatedly",
    "2005": "advice '${0}' already exists",

    "2100": "Error in route configuration file,Please read the official documentation!",
    "2101": "Error in route results configuration",
    "2102": "Error in access route",
    "2103": "Route '${0}' is not exist",

    "2200": "Error in filter configuration file,Please read the official documentation!",

    "2500": "Error in orm configuration file,Please read the official documentation!",

    "2600": "Error in redis configuration file,Please read the official documentation!",
    "2601": "redis client '${0}' does not exist",

    "2700": "Error in security configuration file,Please read the official documentation!",

    "2800": "Error in data source configuration file,Please read the official documentation!",

    "3002": "Attempt to allocate Buffer larger than maximum size",
    "3010": "key already exists，it cannot be defined as object",
    "3011": "need value"
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
