import { memory } from "@memory/memory";
import { BaseClass } from "../../../src/BaseClass";
import { inMemory } from "@memory/inMemory";

@memory("memoryTestInstance")
export class MemoryTestIntance extends BaseClass {
  @inMemory()
  public value: string;

  constructor(id: string) {
    super(id);
  }

  public setValue(value: string) {
    this.value = value;
    return this;
  }
}
