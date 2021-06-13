import { Group } from "./Group.ts";
import { Route } from "./Route.ts";
import { pathHelper } from "../../helpers/path.ts";
import { pathToRegexp } from "https://deno.land/x/path_to_regexp@v6.2.0/index.ts";
import { resolve } from "https://deno.land/std@0.97.0/path/mod.ts";
import { walk } from "https://deno.land/std@0.97.0/fs/mod.ts";
import config from "../config/index.ts";

export class Router {
  private routesCompiled = false;
  private compiledRoutes: any[] = [];
  private routeStore: Route[] = [];
  public groups: Group[] = [];

  public group(name: string) {
    const group = new Group(name);
    this.groups.push(group);

    return group;
  }

  private route(
    method: string,
    pattern: string,
    handler: string | any[] | Function,
  ) {
    const route = new Route({
      method,
      handler,
      pattern: pathHelper.removeTrailingSlash(pattern),
    }, this);
    this.routeStore.push(route);

    return route;
  }

  public get routes() {
    return new Proxy(this.compiledRoutes, {
      set(_t, _p, _v) {
        throw new Error("Cannot manually add route");
      },
      deleteProperty(_t, _p) {
        throw new Error("Cannot manually remove route");
      },
    });
  }

  public get rawRoutes() {
    return this.routeStore;
  }

  public setCompiledRoutes(routes: any[]) {
    if (this.routesCompiled) {
      throw new Error(("Routes have been compiled already"));
    }

    this.compiledRoutes = routes;
    this.routeStore = [];
    this.groups = [];
    this.routesCompiled = true;
  }

  public async loadRoutes(): Promise<void> {
    const routesDir = resolve(Deno.cwd(), config.get("directories.routes"));

    for await (const file of walk(routesDir)) {
      if (file.isFile) {
        const module = await import(file.path);

        const route = module["default"] || module["route"] ||
          module[file.name.split(".")[0]] ||
          module[`${file.name.split(".")[0]}Routes`];

        if (!route) {
          throw new Error(
            `Route ${file.path} does not contain any of the expected exports`,
          );
        }

        route.call(null, this);
      }
    }
  }

  public lookup(url: string, method: string) {
    url = pathHelper.removeTrailingSlash(url);

    const route = this.routes.find((route) =>
      new RegExp(url).test(route.pattern) && route.method === method
    );

    if (!route) {
      throw {
        error: true,
        type: "ROUTE_NOT_FOUND",
        status: 404,
        message: "The route you were looking for does not exist",
      };
    }

    Object.assign(route, this.parseUrlPath(route.pattern, url));
    return route;
  }

  private parseUrlPath(pattern: string, url: string) {
    const keys: any[] = [];
    const params: any = {};

    const regexp = pathToRegexp(pattern, keys);
    regexp.exec(url);

    const match = url.match(regexp);

    if (match) {
      for (let i = 0; i < keys.length; i++) {
        const prop = keys[i].name;
        const value = match[i + 1];

        params[prop] = value;
      }

      return { params };
    }

    return null;
  }

  // Route methods
  public get(pattern: string, handler: Function) {
    return this.route("GET", pattern, handler);
  }

  public post(pattern: string, handler: Function) {
    return this.route("POST", pattern, handler);
  }

  public put(pattern: string, handler: Function) {
    return this.route("PUT", pattern, handler);
  }

  public delete(pattern: string, handler: Function) {
    return this.route("DELETE", pattern, handler);
  }

  public options(pattern: string, handler: Function) {
    return this.route("OPTIONS", pattern, handler);
  }
}
