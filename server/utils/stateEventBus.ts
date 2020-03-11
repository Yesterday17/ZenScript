type StateEventBusCallback = (...args: any[]) => any;

export class StateEventBus {
  private states: Map<String, [boolean, any[]]> = new Map();
  private events: Map<String, StateEventBusCallback[]> = new Map();

  public on(name: string, callback: any) {
    if (!this.states.has(name)) {
      this.states.set(name, [false, undefined]);
      this.events.set(name, []);
    }

    let [fin, args] = this.states.get(name);
    if (fin) {
      callback(args);
    } else {
      this.events.get(name).push(callback);
    }
  }

  public finish(name: string, ...args: any[]) {
    if (this.states.has(name)) {
      this.states.set(name, [true, args]);
      this.events.set(
        name,
        this.events.get(name).filter(e => e(args), false)
      );
    }
  }

  public revoke(name: string) {
    if (this.states.has(name) && this.states.get(name)) {
      this.states.set(name, [false, undefined]);
    }
  }
}
