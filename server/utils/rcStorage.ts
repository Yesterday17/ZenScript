export class RCStorage<T> {
  public readonly type: string;
  public readonly depth: number;
  private storage: Map<symbol, T | RCStorage<T>>;

  public get keys(): string[] {
    return Array.from(this.storage.keys()).map(
      (s) => Symbol.keyFor(s) as string
    );
  }

  public get values(): string[] {
    const result: string[] = [];
    Array.from(this.storage.keys()).forEach((key) => {
      const value = this.storage.get(key);
      if (value instanceof RCStorage) {
        result.push(...value.values.map((v) => `${Symbol.keyFor(key)}:${v}`));
      } else {
        result.push(Symbol.keyFor(key) as string);
      }
    });
    return result;
  }

  public get valueTypes(): string[] {
    return Array.from(this.storage.values()).map(
      (value) => (value as RCStorage<T>).type
    );
  }

  constructor(type: string, depth = 1) {
    this.type = type;
    this.storage = new Map();

    if (depth < 1) {
      throw new Error('Depth cannot be smaller than 1!');
    }

    this.depth = depth;
  }

  has(entry: string): boolean {
    const keys = entry.split(':');

    if (keys.length === 1) {
      return this.storage.has(Symbol.for(entry));
    } else {
      if (!this.has(keys[0]) || !(this.get(keys[0]) instanceof RCStorage)) {
        return false;
      }
      return this.getStorage(keys[0]).has(keys.slice(1).join(':'));
    }
  }

  getStorage(key: string): RCStorage<T> {
    return this.get(key) as RCStorage<T>;
  }

  get(entry: string): T | RCStorage<T> | undefined {
    const keys = entry.split(':');
    if (keys.length === 1) {
      return this.storage.get(Symbol.for(keys[0]));
    } else {
      if (!this.has(keys[0]) || !(this.get(keys[0]) instanceof RCStorage)) {
        return undefined;
      }
      return this.getStorage(keys[0]).get(keys.slice(1).join(':'));
    }
  }

  create(key: string): void {
    this.storage.set(Symbol.for(key), new RCStorage(key, this.depth - 1));
  }

  set(entry: string, value: T): void {
    const keys = entry.split(':');

    if (keys.length !== this.depth) {
      throw new Error(
        `Incorrect depth! Depth of RCStorage is ${this.depth}, but depth of key is ${keys.length}!`
      );
    }

    if (keys.length === 1) {
      this.storage.set(Symbol.for(keys[0]), value);
    } else {
      if (!this.has(keys[0])) {
        this.create(keys[0]);
      }
      (this.get(keys[0]) as RCStorage<T>).set(keys.slice(1).join(':'), value);
    }
  }

  clear(): void {
    this.storage.clear();
  }

  // /**
  //  * Get specified item or RCStorage
  //  * @param entry key, such as `minecraft:stone:1`
  //  */
  // find(entry: string): RCStorage | Object | undefined {
  //   const keys = entry.split(':');

  //   if (keys.length > this.depth) {
  //     return undefined;
  //   }

  //   let store = this as RCStorage;
  //   for (let i = 0; i < keys.length - 1; i++) {
  //     if (!store.has(entry[i]) || !(store.get(entry[i]) instanceof RCStorage)) {
  //       return undefined;
  //     }
  //     store = store.get(entry[i]) as RCStorage;
  //   }

  //   return store.get(entry[entry.length - 1]);
  // }
}
