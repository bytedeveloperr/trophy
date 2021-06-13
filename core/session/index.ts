import { v4 } from "https://deno.land/std@0.97.0/uuid/mod.ts";
import { MemoryStore } from "./stores/Memory.ts";

export class Session {
  private options: any = { store: "memory" };
  public sid: string;
  private store!: MemoryStore;

  constructor(sid: string) {
    this.sid = sid;

    switch (this.options.store) {
      case "memory":
        this.store = new MemoryStore(sid);
        break;
      default:
        this.store = new MemoryStore(sid);
        break;
    }
  }

  set(name: string, value: any) {
    return this.store.set(this.sid, name, value);
  }

  get(name?: string) {
    return this.store.get(this.sid, name);
  }

  delete(name: string) {
    return this.store.delete(this.sid, name);
  }

  clear() {
    return this.store.clear(this.sid);
  }

  sessionExist() {
    return this.store.sessionExists(this.sid);
  }
}
