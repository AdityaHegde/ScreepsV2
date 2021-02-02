import sinon from "sinon";
import should from "should";

import { MemoryTestBase } from "./MemoryTestBase";
import { memory } from "@memory/memory";
import { instanceInMemory } from "@memory/instanceInMemory";
import { MemoryTestIntance } from "./MemoryTestIntance";
import { BaseClass } from "../../../src/BaseClass";

@MemoryTestBase.Suite
export class InstanceInMemoryTest extends MemoryTestBase {
  @MemoryTestBase.Test()
  public testWithClassObject() {
    @memory("memoryTest")
    class MemoryTest extends BaseClass {
      @instanceInMemory(MemoryTestIntance)
      instance: MemoryTestIntance;
    }

    const ma = new MemoryTest("ma");

    should(ma.instance).be.instanceof(MemoryTestIntance);
    should(ma.instance.id).be.equal("1");
    ma.instance = new MemoryTestIntance("mti").setValue("mtv");
    should(ma.instance).be.instanceof(MemoryTestIntance);
    should(ma.instance.id).be.equal("mti");
    should(ma.instance.value).be.equal("mtv");

    // creating another instance with same id will retain data
    const _ma = new MemoryTest("ma");
    should(_ma.instance).be.instanceof(MemoryTestIntance);
    should(_ma.instance.id).be.equal("mti");
    should(_ma.instance.value).be.equal("mtv");

    should(global["Memory"]).be.eql({
      ids: {
        memoryTestInstance: 1,
      },
      memoryTest: {
        ma: {
          instance: "mti",
        },
      },
      memoryTestInstance: {
        mti: {
          value: "mtv",
        },
      },
    });
  }

  @MemoryTestBase.Test()
  public testWithClassObjectAndGetter() {
    @memory("memoryTest")
    class MemoryTest extends BaseClass {
      @instanceInMemory(MemoryTestIntance, () => {
        return new MemoryTestIntance("getter").setValue("getterv");
      })
      instanceWithGetter: MemoryTestIntance;
    }

    const ma = new MemoryTest("ma");

    should(ma.instanceWithGetter).be.instanceof(MemoryTestIntance);
    should(ma.instanceWithGetter.id).be.equal("getter");
    should(ma.instanceWithGetter.value).be.equal("getterv");
    ma.instanceWithGetter = new MemoryTestIntance("mtgi").setValue("mtgv");
    should(ma.instanceWithGetter).be.instanceof(MemoryTestIntance);
    should(ma.instanceWithGetter.id).be.equal("mtgi");
    should(ma.instanceWithGetter.value).be.equal("mtgv");

    // creating another instance with same id will retain data
    const _ma = new MemoryTest("ma");
    should(_ma.instanceWithGetter).be.instanceof(MemoryTestIntance);
    should(_ma.instanceWithGetter.id).be.equal("mtgi");
    should(_ma.instanceWithGetter.value).be.equal("mtgv");

    should(global["Memory"]).be.eql({
      memoryTest: {
        ma: {
          instanceWithGetter: "mtgi",
        },
      },
      memoryTestInstance: {
        getter: {
          value: "getterv",
        },
        mtgi: {
          value: "mtgv",
        },
      },
    });
  }
}
