import { ServerRequest } from "https://deno.land/std@0.97.0/http/server.ts";
import { readAll } from "https://deno.land/std@0.97.0/io/util.ts";
import { readerFromStreamReader } from "https://deno.land/std@0.97.0/io/mod.ts";
import { qs } from "https://deno.land/x/deno_qs@0.0.1/mod.ts";

const textDecoder = new TextDecoder();

export class BodyParser {
  public request: ServerRequest | Deno.RequestEvent;
  public options: any;

  constructor(request: ServerRequest | Deno.RequestEvent, options: any) {
    this.request = request;
    this.options = options;
  }

  json(text: string) {
    return JSON.parse(text);
  }

  urlencoded(text: string) {
    return qs.parse(text);
  }

  async body() {
    let contentType, body;

    if (this.request instanceof ServerRequest) {
      contentType = this.request.headers.get("content-type");
      body = this.request.body;
    } else {
      contentType = this.request.request.headers.get("content-type");
      body = this.request.request.body?.getReader();

      if (!body) {
        return;
      }
      body = readerFromStreamReader(body);
    }

    body = await readAll(body);
    const bodyText = textDecoder.decode(body);

    if (this.options.limit !== null && bodyText.length > this.options.limit) {
      throw new Error(
        `Body Limit has been exceeded: ${bodyText.length} > ${this.options.limit}`,
      );
    }

    switch (contentType) {
      case "application/json":
        return this.json(bodyText);
      case "application/x-www-form-urlencoded":
        return this.urlencoded(bodyText);
      default:
        return undefined;
    }
  }
}
