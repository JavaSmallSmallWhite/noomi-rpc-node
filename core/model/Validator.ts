/**
 * 校验器函数类型
 * @param T - 校验值类型
 * @param P - 参数类型
 */
type ValidatorFunction<T, P extends unknown[]> = (value: T, ...params: P) => boolean;

/**
 * 模型验证器
 */
export class Validator {
  /**
   * 验证器集合
   */
  private static validators: Map<string, ValidatorFunction<unknown, unknown[]>> = new Map();

  /**
   * 是否拥有该名字的验证器
   * @param validatorName - 验证器名称
   */
  public static hasValidator(validatorName: string): boolean {
    return this.validators.has(validatorName);
  }

  /**
   * 添加验证器
   * @param name - 验证器名
   * @param foo - 验证器方法
   */
  public static addValidator<T, P extends unknown[]>(
    name: string,
    foo: ValidatorFunction<T, P>
  ): void {
    if (typeof foo !== "function") {
      return;
    }
    this.validators.set(name, foo as ValidatorFunction<unknown, unknown[]>);
  }

  /**
   * 添加验证器集
   * @param config - 验证器集合
   */
  public static addValidators(config: Record<string, ValidatorFunction<any, any[]>>): void {
    Object.keys(config).forEach((key) => {
      this.addValidator(key, config[key]);
    });
  }

  /**
   * 验证
   * @param name - 验证名
   * @param value - 验证内容
   * @param params - 附加参数数组，根据调用确定
   * @returns 校验结果，true:通过，false:不通过
   */
  public static validate<T, P extends unknown[]>(name: string, value: T, ...params: P): boolean {
    const validator = this.validators.get(name);
    if (!validator) {
      return true; // 没有匹配的校验器，默认通过
    }
    return validator(value, ...params);
  }
}

/**
 * 初始化验证器
 */
Validator.addValidators({
  nullable: function (value: unknown) {
    return value !== undefined && value !== null && value !== "";
  },
  min: function (value: number, min: number) {
    return value >= min;
  },
  max: function (value: number, max: number) {
    return value <= max;
  },
  between: function (value: number, min: number, max: number) {
    return value >= min && value <= max;
  },
  minLength: function (value: unknown, min: number) {
    return typeof value === "string" && value.length >= min;
  },
  maxLength: function (value: unknown, max: number) {
    return typeof value === "string" && value.length <= max;
  },
  betweenLength: function (value: unknown, min: number, max: number) {
    return typeof value === "string" && value.length >= min && value.length <= max;
  },
  date: function (value: string) {
    return /^\d{4}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])$/.test(value);
  },
  datetime: function (value: string) {
    return /^\d{4}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\s+([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/.test(
      value
    );
  },
  time: function (value: string) {
    return /([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/.test(value);
  },
  email: function (value: string) {
    return /^\w+\S*@[\w\d]+(\.\w+)+$/.test(value);
  },
  url: function (value: string) {
    return /^(https?|ftp):\/\/[\w\d]+\..*/.test(value);
  },
  mobile: function (value: string) {
    return /^1[3-9]\d{9}$/.test(value);
  },
  idno: function (value: string) {
    return /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(
      value
    );
  },
  /**
   * 判断值是否匹配数组某个元素
   * @param value -     值
   * @param arr -       带匹配数组
   */
  in: function (value: unknown, arr: unknown[]) {
    if (!arr || !Array.isArray(arr)) {
      return false;
    }
    return arr.includes(value);
  }
});
