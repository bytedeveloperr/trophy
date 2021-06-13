import HttpResponse from "./HttpResponse.ts";
import HttpRequest from "./HttpRequest.ts";
import { setCookie } from "https://deno.land/std@0.97.0/http/cookie.ts";
import { middleware } from "./Middleware.ts";
import { ServerRequest } from "https://deno.land/std@0.97.0/http/server.ts";
import type { Router } from "./Router.ts";
import { Value } from "../../helpers/Value.ts";

export class Responder {
  private response: HttpResponse;
  private request: HttpRequest;
  private originalRequest: ServerRequest | Deno.RequestEvent;
  private router: Router;

  constructor(req: ServerRequest | Deno.RequestEvent, router: Router) {
    this.originalRequest = req;
    this.response = new HttpResponse(req);
    this.request = new HttpRequest(req);
    this.router = router;
  }

  private async runMiddleware(middle: any) {
    return middleware.execute(this.request, this.response, middle);
  }

  private async makeResponse() {
    // return (async () => {
    const route = this.router.lookup(this.request.path, this.request.method);

    if (!route) {
      throw new Error("Route does not exist");
    }

    const canContinue = await this.runMiddleware(route.middleware);

    if (!canContinue) {
      return;
    }

    let handler = await route.handler(this.request, this.response);

    let body;
    if (typeof handler === "object") {
      if (!handler.body) {
        body = handler;
      } else {
        body = handler?.body || this.response.body;
      }
    } else {
      body = String(handler);
    }

    let status = handler?.status || this.response.statusCode;
    let headers = handler?.headers || this.response.headers;
    let redirect = handler?.redirect;

    if (typeof body === "object") {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(body);
    }

    if (redirect) {
      headers["Location"] = redirect.url;
      status = 302;
    }

    const response = new Response(body, { status, headers });

    this.response.cookies.forEach(({ name, value }) => {
      setCookie(response, { name, value });
    });

    return { body, response };
    // })();
  }

  public async respond(): Promise<void> {
    try {
      const makeResponse = await this.makeResponse();
      if (!makeResponse) {
        return;
      }

      const { body, response } = makeResponse;

      if (this.originalRequest instanceof ServerRequest) {
        this.originalRequest.respond({
          body,
          headers: new Headers(response.headers),
          status: response.status,
        });
      } else {
        this.originalRequest.respondWith(response);
      }
    } catch (e) {
      console.log(e);
      let body = JSON.stringify(e);
      let status = e.statusCode || e.status || 500;

      if (this.originalRequest instanceof ServerRequest) {
        this.originalRequest.respond({ body, status });
      } else {
        this.originalRequest.respondWith(new Response(body, { status }));
      }
    }
  }
}
