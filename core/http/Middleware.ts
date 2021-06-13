import { resolve } from "https://deno.land/std@0.97.0/path/mod.ts";
import config from "../config/index.ts";
import HttpRequest from "./HttpRequest.ts";
import HttpResponse from "./HttpResponse.ts";

let middlewareInstance: Middleware;

export class Middleware {
  private globalMiddlewareLoaded = false;
  private global: any[] = [];

  constructor() {}

  async loadGlobalMiddleware() {
    if (this.globalMiddlewareLoaded) {
      return;
    }

    // deno-fmt-ignore
    const { Middleware } = await import(resolve(Deno.cwd(), config.get("directories.config"),`Middleware.${config.get("extension")}`));

    if (!Middleware) {
      throw new Error("Middleware config file invalid");
    }

    const middleware = new Middleware();

    if (middleware.globalMiddleware) {
      for (const key in middleware.globalMiddleware) {
        const middle: string = middleware.globalMiddleware[key];

        if (middle.startsWith("trophy:")) {
          const middlewarePath = "../../" + middle.substr(7);
          // deno-fmt-ignore
          const module = await import(`${middlewarePath}.${config.get("extension")}`);
          this.global.push(module["default"] || module[key]);
        }
      }
    }

    this.globalMiddlewareLoaded = true;
  }

  // instance(){
  //   if (!(middlewareInstance instanceof Middleware)) {
  //     middlewareInstance=new Middleware()
  //   }

  //   return middlewareInstance
  // }

  public async execute(
    request: HttpRequest,
    response: HttpResponse,
    middleware: Array<any>,
  ) {
    let cont = false;

    middleware = [...this.global, ...middleware];

    const next = () => {
      cont = true;
    };

    for (let i = 0; i < middleware.length; i++) {
      const current = new middleware[i]();

      if (i == 0) {
        current.handler(request, response, next);
      } else {
        if (cont) {
          cont = false;
          current.handler(request, response, next);
        } else {
          break;
        }
      }
    }

    return cont;
  }
}

const middleware = new Middleware();
await middleware.loadGlobalMiddleware();

export { middleware };
