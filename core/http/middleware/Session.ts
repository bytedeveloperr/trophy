import { v4 } from "https://deno.land/std@0.97.0/uuid/mod.ts";
import { Session as Sess } from "../../session/index.ts";

export class Session {
  private request: any;
  private response: any;

  handler(request: any, response: any, next: any) {
    this.request = request;
    this.response = response;

    let sid = this.request.cookie.get("sid");

    if (!sid || !!(sid == "undefined") || !!(sid == "null")) {
      sid = this.response.setCookie("sid", v4.generate());
    }

    this.request.session = new Sess(sid);

    next();
  }
}
