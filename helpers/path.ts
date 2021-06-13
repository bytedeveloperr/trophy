export const pathHelper = {
  stripDoubleSlahes: (path: string) => {
    return path.replace(/([^:]\/)\/+/g, "$1");
  },
  removeTrailingSlash(url: string) {
    if (url !== "/") {
      return url.replace(/\/+$/, "");
    }

    return url;
  },
};
