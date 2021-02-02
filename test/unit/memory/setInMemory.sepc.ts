import { memory } from "console";
import { BaseClass } from "../../../src/BaseClass";
import MemorySet from "@memory/MemorySet";
import { setInMemory } from "@memory/setInMemory";
import { MemoryTestBase } from "./MemoryTestBase";

@MemoryTestBase.Suite
export class SetInMemoryTest extends MemoryTestBase {
  @MemoryTestBase.Test()
  public testWithLiterals() {
    @memory("memoryTest")
    class MemoryTest extends BaseClass {
      @setInMemory()
      public stringMap: MemorySet<string>;
    }
  }
}
