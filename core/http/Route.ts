import type { Group } from "./Group.ts";
import type { Router } from "./Router.ts";

export class Route {
  public prefixes: Array<string> = [];
  public middlewares: Array<Function> = [];
  public routeGroup!: Group;
  public handler!: string;
  public method!: string;
  public pattern!: string;
  private router: Router;

  constructor(route: any, router: Router) {
    this.router = router;
    Object.assign(this, route);
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

  group(groupName: string) {
    const group = this.router.groups.find((group) => group.name === groupName);
    if (!group) {
      throw new Error(`Group: ${groupName} does not exist`);
    }

    this.routeGroup = group;
    return this;
  }
}
