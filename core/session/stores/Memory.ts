export class MemoryStore {
  public sessions: any = {};

  constructor(sid: string) {
    if (!this.sessions[sid]) {
      this.sessions[sid] = {};
    }
  }

  sessionExists(sid: string) {
    return this.sessions[sid] ? true : false;
  }

  set(sid: string, name: string, value: any) {
    this.sessions[sid][name] = value;
    return value;
  }

  get(sid: string, name?: string) {
    if (!name) {
      return this.sessions[sid];
    }
    return this.sessions[sid][name];
  }

  delete(sid: string, name: string) {
    delete this.sessions[sid][name];
    return true;
  }

  clear(sid: string) {
    this.sessions[sid] = {};
  }
}
