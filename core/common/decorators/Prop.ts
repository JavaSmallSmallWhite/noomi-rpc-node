import { PropOption } from "noomi";
import { ModelManager } from "../../model/ModelManager";

/**
 * 属性装饰器（DataModel下），装饰属性
 * @param cfg - 配置项
 */
export function Prop(cfg?: PropOption) {
  return (target: unknown, name: string) => {
    if (cfg) {
      if (cfg.validator && typeof cfg.validator === "string") {
        const o = {};
        o[<string>cfg.validator] = [];
        cfg.validator = o;
      }
      //添加属性到model manager
      ModelManager.setProp(target.constructor.name, name, cfg);
    } else {
      ModelManager.setProp(target.constructor.name, name, {});
    }
  };
}
