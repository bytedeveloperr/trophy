import { serve, serveTLS } from "https://deno.land/std@0.97.0/http/server.ts";
import { ServerOptions } from "../../../interfaces/http.ts";
import type { Router } from "../Router.ts";
import { Responder } from "../Responder.ts";
import { Server } from "../Server.ts";

export class StandardServer extends Server {
  constructor(router: Router, options?: ServerOptions) {
    super(router, options);

    if (this.certFile && this.keyFile) {
      this.listener = serveTLS({
        port: Number(this.port),
        hostname: this.hostname,
        certFile: this.certFile,
        keyFile: this.keyFile,
      });
    } else {
      this.listener = serve({
        port: Number(this.port),
        hostname: this.hostname,
      });
    }
  }

  async start() {
    for await (const request of this.listener) {
      const responder = new Responder(request, this.router);
      await responder.respond();
    }
  }
}
