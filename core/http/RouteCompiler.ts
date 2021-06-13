import { Route } from "./Route.ts";
import { resolve } from "https://deno.land/std@0.97.0/path/mod.ts";
import { pathHelper } from "../../helpers/path.ts";
import config from "../config/index.ts";

export class RouteCompiler {
  private routes;

  constructor(routes: Array<Route>) {
    this.routes = routes;
  }

  async compile() {
    const routes: {
      pattern: string;
      handler: string | any[] | Function;
      middleware: Function[];
      method: string;
    }[] = [];

    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];
      let pattern, handler, method, middleware;

      if (route.routeGroup) {
        pattern = pathHelper.stripDoubleSlahes(
          [...route.routeGroup.prefixes, ...route.prefixes].join("/") +
            route.pattern,
        );
        middleware = [
          ...route.routeGroup?.middlewares,
          ...route.middlewares,
        ];
      } else {
        pattern = pathHelper.stripDoubleSlahes(
          route.prefixes.join("/") + route.pattern,
        );
        middleware = route.middlewares;
      }

      handler = await this.parseRouteHandler(route.handler);
      method = route.method;

      routes.push({ pattern, handler, middleware, method });
    }

    return routes;
  }

  async parseRouteHandler(handler: string | Array<any> | Function) {
    if (typeof handler === "string") {
      return await this.parseStringHandler(handler);
    } else if (Array.isArray(handler)) {
      return await this.parseArrayHandler(handler);
    } else if (typeof handler === "function") {
      return handler;
    }
  }

  async parseStringHandler(text: string) {
    if (!text.includes("@")) {
      throw new Error("Invalid string route handler");
    }

    const parts = text.split("@");
    if (!parts[0] || parts[0] === "") {
      throw new Error("Controller class part is required in route handler");
    }
    if (!parts[1] || parts[1] === "") {
      throw new Error("Controller method part is required in route handler");
    }

    return await this.loadRouteController(parts[0], parts[1]);
  }

  async parseArrayHandler(handler: Array<any>) {
    if (!handler[0] || handler[0] === "") {
      throw new Error("Controller class part is required in route handler");
    }
    if (!handler[1] || handler[1] === "") {
      throw new Error("Controller method part is required in route handler");
    }

    if (typeof handler[0] === "string") {
      return await this.loadRouteController(handler[0], handler[1]);
    }
    return new handler[0]()[handler[1]];
  }

  async loadRouteController(name: string, method: string) {
    const module = await import(
      resolve(Deno.cwd(), config.get("directories.controllers"), name + ".ts")
    );
    const controller = module["default"] || module[name];

    // console.log(module);

    if (controller) {
      return new controller()[method];
    }
  }
}
