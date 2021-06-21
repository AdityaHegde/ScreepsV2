import {BaseClassMemory} from "./BaseClass";

export class BaseInstanceClass<MemoryType extends BaseClassMemory = any> {
  public readonly id: string;
  public memory: MemoryType;

  public constructor(id: string, memory: MemoryType) {
    this.id = id;
    this.memory = memory;
  }
}
