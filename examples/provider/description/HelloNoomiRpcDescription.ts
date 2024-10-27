import { Type } from "@furyjs/fury";
const baseDescription = {
  errorMessage: Type.string(),
  code: Type.int32()
};

export class HelloNoomiRpcDescription {
  sayHi() {
    return [
      Type.tuple([Type.string(), Type.int32()]),
      Type.object("500", { number: Type.int32(), errorMessage: Type.string(), ...baseDescription })
    ];
  }
}
