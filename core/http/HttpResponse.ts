class HttpResponse {
  public request;
  public headers: any = {};
  public cookies: Array<any> = [];
  public statusCode: number = 200;
  public body?: string;

  constructor(request: any) {
    this.request = request;
  }

  set(headers: Array<any> | any): HttpResponse {
    if (Array.isArray(headers)) {
      headers.forEach((header) => {
        this.headers = { ...this.headers, ...header };
      });
    } else if (typeof headers === "object" && headers !== null) {
      this.headers = { ...this.headers, ...headers };
    }

    return this;
  }

  header(key: string, value: string): HttpResponse {
    this.headers[key] = value;

    return this;
  }

  status(code: number): HttpResponse {
    this.statusCode = code;
    return this;
  }

  redirect(url: string): void {
    this.header("Location", url);
    this.status(302);
  }

  send(value: any): void {
    if (typeof value === "object") {
      value = JSON.stringify(value);
      this.header("Content-Type", "application/json");
    } else {
      this.header("Content-Type", "text/html");
    }

    this.body = value;
  }
}

export default HttpResponse;
