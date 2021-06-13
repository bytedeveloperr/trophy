import "../../interfaces/http.ts";
import type { Router } from "./Router.ts";
import { ServerOptions } from "../../interfaces/http.ts";

export class Server {
  protected port?: number;
  protected hostname?: string;
  protected certFile?: string;
  protected keyFile?: string;
  protected listener!: Deno.Listener | any;
  protected router: any;

  protected constructor(router: Router, options?: ServerOptions) {
    this.router = router;

    this.port = options?.port || 3000;
    this.hostname = options?.hostname || "0.0.0.0";
    this.certFile = options?.certFile;
    this.keyFile = options?.keyFile;
  }

  get server(): any {
    return this.listener;
  }

  stop(): void {
    this.server.close();
    return;
  }
}
