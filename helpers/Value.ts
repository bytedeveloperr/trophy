export class Value {
  static isPromise(value: any) {
    return !!value && typeof value.then === "function";
  }
}
