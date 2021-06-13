import { ServerRequest } from "https://deno.land/std@0.97.0/http/server.ts";
import { qs } from "https://deno.land/x/deno_qs@0.0.1/mod.ts";
import { BodyParser } from "./parser/body.ts";

class HttpRequest {
  public raw: ServerRequest | Deno.RequestEvent;
  private url!: URL;

  constructor(raw: ServerRequest | Deno.RequestEvent) {
    this.raw = raw;

    try {
      if (this.raw instanceof ServerRequest) {
        this.url = new URL(this.raw.url, `${this.protocol}://${this.host}`);
      } else {
        this.url = new URL(this.raw.request.url);
      }
    } catch (e) {}
  }

  get host() {
    return this.header("x-forwarded-host") || this.header("host");
  }

  get protocol() {
    let proto: string;
    const referer = this.header("referer") || "";
    proto = this.header("x-forwarded-proto") || referer.split(":")[0] || "http";

    return proto;
  }

  async getBody() {
    const bodyParser = new BodyParser(this.raw, {});
    return await bodyParser.body() || undefined;
  }

  header(name: string) {
    if (this.raw instanceof ServerRequest) {
      return this.raw.headers.get(name);
    }
    return this.raw.request.headers.get(name);
  }

  get path() {
    return this.url.pathname;
  }

  get query() {
    return qs.parse(this.url.search.substr(1));
  }
  get method() {
    if (this.raw instanceof ServerRequest) {
      return this.raw.method;
    }
    return this.raw.request.method;
  }

  get originalUrl() {
    return this.url.toString();
  }

  get port() {
    if (!this.url.port) {
      return this.protocol === "https" ? 443 : 80;
    }

    return this.url.port;
  }
}

export default HttpRequest;
