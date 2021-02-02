import should from "should";

import { MemoryTestBase } from "./MemoryTestBase";
import { mapInMemory } from "@memory/mapInMemory";
import { memory } from "@memory/memory";
import { BaseClass } from "../../../src/BaseClass";
import { MemoryTestIntance } from "./MemoryTestIntance";
import MemoryMap from "@memory/MemoryMap";

const DATA = [["id1", "val1"], ["id2", "val2"], ["id3", "val3"]];

@MemoryTestBase.Suite
export class MapInMemoryTest extends MemoryTestBase {
  @MemoryTestBase.Test()
  public testWithLiterals() {
    @memory("memoryTest")
    class MemoryTest extends BaseClass {
      @mapInMemory()
      public stringMap: MemoryMap<string>;
    }

    const ma = new MemoryTest("ma");
    DATA.forEach(
      (data: [string, string]) =>
        ma.stringMap.set(data[0], data[1]),
    );

    DATA.forEach((data: [string, string]) => {
      const value = ma.stringMap.get(data[0]);
      should(value).be.equal(data[1]);
    });

    // creating another instance with same id will retain data
    const _ma = new MemoryTest("ma");
    DATA.forEach((data: [string, string]) => {
      const value = _ma.stringMap.get(data[0]);
      should(value).be.equal(data[1]);
    });

    should(global["Memory"]).be.eql({
      memoryTest: {
        ma: {
          stringMap: {
            "id1": "val1",
            "id2": "val2",
            "id3": "val3",
          },
        },
      },
    });
  }

  @MemoryTestBase.Test()
  public testWithGetterAndSetter() {
    @memory("memoryTest")
    class MemoryTest extends BaseClass {
      @mapInMemory(
        (instance: MemoryTestIntance) => instance.id,
        (key: string, id: string) => new MemoryTestIntance(id),
      )
      public instanceMap: MemoryMap<MemoryTestIntance>;
    }

    const ma = new MemoryTest("ma");
    DATA.forEach(
      (data: [string, string]) =>
        ma.instanceMap.set(data[0], new MemoryTestIntance(data[0]).setValue(data[1])),
    );

    DATA.forEach((data: [string, string]) => {
      const instance = ma.instanceMap.get(data[0]);
      should(instance).be.instanceof(MemoryTestIntance);
      should(instance.id).be.equal(data[0]);
      should(instance.value).be.equal(data[1]);
    });

    // creating another instance with same id will retain data
    const _ma = new MemoryTest("ma");
    DATA.forEach((data: [string, string]) => {
      const instance = _ma.instanceMap.get(data[0]);
      should(instance).be.instanceof(MemoryTestIntance);
      should(instance.id).be.equal(data[0]);
      should(instance.value).be.equal(data[1]);
    });

    should(global["Memory"]).be.eql({
      memoryTest: {
        ma: {
          instanceMap: {
            "id1": "id1",
            "id2": "id2",
            "id3": "id3",
          },
        },
      },
      memoryTestInstance: {
        id1: {
          value: "val1",
        },
        id2: {
          value: "val2",
        },
        id3: {
          value: "val3",
        },
      },
    });
  }
}
