import { RouteCompiler } from "./core/http/RouteCompiler.ts";
import { Router } from "./core/http/Router.ts";
import { ServerFactory } from "./core/http/ServerFactory.ts";
import { ServerOptions } from "./interfaces/http.ts";

export class Application {
  private serverFactory: ServerFactory;
  private routeCompiler: RouteCompiler;
  public router = new Router();

  constructor(options?: ServerOptions) {
    this.routeCompiler = new RouteCompiler(this.router.rawRoutes);
    this.serverFactory = new ServerFactory(this.router, options);
  }

  async bootstrap() {
    await this.router.loadRoutes();
    this.router.setCompiledRoutes(await this.routeCompiler.compile());
    await this.serverFactory.startServer();
  }
}
