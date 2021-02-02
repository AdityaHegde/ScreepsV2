export default class MemorySet<T> extends Set {
  private memory: Array<any>;
  private serializer: (value: T) => any;
  private deserializer: (value: any) => T;

  constructor(
    memory: Array<any>,
    serializer: (value: T) => any,
    deserializer: (value: any) => T
  ) {
    super();

    this.memory = memory;
    this.serializer = serializer;
    this.deserializer = deserializer;

    this.memory.forEach((memoryEntry) => {
      super.add(this.deserializer(memoryEntry));
    });
  }

  public get size(): number {
    return this.memory.length;
  }

  public add(value: T) {
    if (!this.has(value)) {
      super.add(value);
      this.memory.push(this.serializer(value));
    }
    return this;
  }

  public delete(value: T) {
    if (this.has(value)) {
      super.delete(value);
      this.memory.splice(this.memory.indexOf(this.serializer(value)), 1);
      return true;
    }
    return false;
  }

  public replace(arr: Array<T>) {
    this.memory.splice(0, this.memory.length);
    this.clear();
    arr.forEach((ele) => {
      this.add(ele);
    });
  }
}
