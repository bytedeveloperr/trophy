import { ServerOptions } from "../../../interfaces/http.ts";
import { Responder } from "../Responder.ts";
import type { Router } from "../Router.ts";
import { Server } from "../Server.ts";

export class NativeServer extends Server {
  constructor(router: Router, options?: ServerOptions) {
    super(router, options);

    if (this.certFile && this.keyFile) {
      this.listener = Deno.listenTls({
        port: Number(this.port),
        hostname: this.hostname,
        keyFile: this.keyFile,
        certFile: this.certFile,
      });
    } else {
      this.listener = Deno.listen({
        port: Number(this.port),
        hostname: this.hostname,
      });
    }
  }

  async start() {
    while (true) {
      const conn = await this.listener.accept();
      (async () => {
        const http = Deno.serveHttp(conn);
        while (true) {
          const request = await http.nextRequest();
          if (request) {
            const responder = new Responder(request, this.router);
            responder.respond();
          } else {
            break;
          }
        }
      })();
    }
  }
}
