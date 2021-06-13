import { resolve } from "https://deno.land/std@0.97.0/path/mod.ts";

const textDecoder = new TextDecoder();
let configInstance: Config;

class Config {
  public trophyConfig!: any;

  async loadTrophyConfig() {
    const buf = await Deno.readFile(resolve(Deno.cwd(), "trophy.config.json"));
    this.trophyConfig = JSON.parse(textDecoder.decode(buf));
  }

  get(prop: string) {
    return prop.split(".").reduce((res, i) => res[i], this.trophyConfig);
  }

  static instance() {
    if (!(configInstance instanceof Config)) {
      configInstance = new Config();
    }

    return configInstance;
  }
}

const config = Config.instance();
await config.loadTrophyConfig();

export default config;
