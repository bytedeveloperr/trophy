import { ServerRequest } from "https://deno.land/std@0.97.0/http/server.ts";
import { BufReader } from "https://deno.land/std@0.97.0/io/bufio.ts";
import HttpRequest from "../core/http/HttpRequest.ts";

export interface ServerOptions {
  serverType: string;
  port?: number;
  hostname?: string;
  certFile?: string;
  keyFile?: string;
  server?: string;
  transport?: "tcp";
}

// export interface IOriginalRequest extends ServerRequest, Deno.RequestEvent {
// }

// export interface IOriginalRequest  ;

// export interface IOriginalRequest {
//   url?: string;
//   method?: string;
//   proto?: string;
//   protoMinor?: number;
//   protoMajor?: number;
//   headers?: Headers;
//   conn?: Deno.Conn;
//   r?: BufReader;
//   readonly request?: Request;
//   respond?: (r: Response) => Promise<void>;
//   respondWith?: (r: Response | Promise<Response>) => Promise<void>;
// }

export interface IRequest extends HttpRequest {
  cookie: {
    get(name: string): string;
  };
}

enum Method {
  GET,
  POST,
  PUT,
  DELETE,
  OPTIONS,
}
