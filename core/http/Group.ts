export class Group {
  public prefixes: Array<string> = [];
  public middlewares: Array<Function> = [];
  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  prefix(prefix: string) {
    this.prefixes.push(prefix);
    return this;
  }

  middleware(middleware: Array<Function> | Function) {
    if (Array.isArray(middleware)) {
      middleware.forEach((midd) => {
        this.middlewares.push(midd);
      });
    } else {
      this.middlewares.push(middleware);
    }

    return this;
  }
}
