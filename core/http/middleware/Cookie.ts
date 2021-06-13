import { getCookies } from "https://deno.land/std@0.97.0/http/cookie.ts";
import { ServerRequest } from "https://deno.land/std@0.97.0/http/server.ts";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

export class Cookie {
  private request: any;
  private response: any;

  handler(request: any, response: any, next: any) {
    this.request = request;
    this.response = response;
    this.request.cookie = {};

    this.request.cookie.get = this.get.call(this);
    this.response.setCookie = this.set.call(this);
    this.response.deleteCookie = this.delete.call(this);

    next();
  }

  private get() {
    return (name: string) => {
      let cookies;

      if (this.request.raw instanceof ServerRequest) {
        cookies = getCookies(this.request.raw);
      } else {
        cookies = getCookies(this.request.raw.request);
      }

      return decodeURIComponent(cookies[name]);
    };
  }

  private set() {
    return (name: string, value: string, options?: any) => {
      if (options?.signed) {
        value = this.sign(value);
      }

      this.response.cookies.push({ name, value: encodeURIComponent(value) });
      return this.response;
    };
  }

  private delete() {
    return (name: string) => {
      this.response.cookies.push({
        name,
        value: undefined,
        expires: new Date(0),
      });
      return this.response;
    };
  }

  private mac(value: string, secret: string = "test") {
    return hmac("sha256", secret, value, "utf8", "base64");
  }

  private sign(value: string, secret?: string) {
    return value + "." + this.mac(value, secret);
  }

  private unsign(value: string, secret?: string) {
    const cookieArr = value.split(".");

    if (!cookieArr[1]) {
      throw new Error("Invalid signed cookie format");
    }

    const mac = this.mac(value, secret);
    console.log({ mac, old: cookieArr[1] });

    if (mac === cookieArr[1]) {
      return cookieArr[1];
    }

    throw new Error("Invalid signed cookie format");
  }
}
