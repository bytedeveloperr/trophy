import { ServerOptions } from "../../interfaces/http.ts";
import type { Router } from "./Router.ts";
import { NativeServer } from "./server/NativeServer.ts";
import { StandardServer } from "./server/StandardServer.ts";

export class ServerFactory {
  private server!: NativeServer | StandardServer;

  constructor(
    router: Router,
    options: ServerOptions = { serverType: "standard" },
  ) {
    options.port = options.port || 3000;
    options.hostname = options.hostname || "0.0.0.0";

    if (options.serverType === "standard") {
      this.server = new StandardServer(router, options);
    } else if (options.serverType === "native") {
      this.server = new NativeServer(router, options);
    }
  }

  async startServer() {
    return await this.server.start();
  }

  async stopServer() {
    return this.server.stop();
  }
}
