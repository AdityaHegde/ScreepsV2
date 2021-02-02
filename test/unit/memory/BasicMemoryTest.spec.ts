import sinon from "sinon";
import should from "should";

import { MemoryTestBase } from "./MemoryTestBase";
import { memory } from "@memory/memory";
import { inMemory } from "@memory/inMemory";

@MemoryTestBase.Suite
export class BasicMemoryTest extends MemoryTestBase {
  @MemoryTestBase.Test()
  public simpleTests() {
    const memoryGetter = this.sandbox.stub().returns("m1");

    @memory("memoryTest")
    class MemoryTest {
      id: string;

      @inMemory(memoryGetter)
      memoryStr: string;

      constructor(id: string) {
        this.id = id;
      }
    }

    const ma = new MemoryTest("ia");
    should(ma.memoryStr).be.equal("m1");
    ma.memoryStr = "mas";

    memoryGetter.returns("m2")
    const mb = new MemoryTest("ib");
    should(mb.memoryStr).be.equal("m2");
    mb.memoryStr = "mbs";

    const mc = new MemoryTest("ic");
    should(mc.memoryStr).be.equal("m2");
    mc.memoryStr = "mcs";

    const md = new MemoryTest("ia");
    should(md.memoryStr).be.equal("mas");

    should(ma.memoryStr).be.equal("mas");
    should(ma["_memoryStr"]).be.equal("mas");
    should(mb.memoryStr).be.equal("mbs");
    should(mb["_memoryStr"]).be.equal("mbs");
    should(mc.memoryStr).be.equal("mcs");
    should(mc["_memoryStr"]).be.equal("mcs");
    
    should(global["Memory"]).be.eql({
      memoryTest: {
        ia: {
          memoryStr: "mas",
        },
        ib: {
          memoryStr: "mbs",
        },
        ic: {
          memoryStr: "mcs",
        },
      },
    });
    
    sinon.assert.calledThrice(memoryGetter);
  }

  @MemoryTestBase.Test()
  public testCustomSerialiser() {
    const memoryGetter = this.sandbox.stub().returns({id: "ina"});

    @memory("memoryTest", "idx")
    class MemoryTest {
      idx: string;

      @inMemory(
        memoryGetter,
        (value) => {return value.id},
        (id) => {return {id}},
      )
      memoryStr: { id: string };

      constructor(idx: string) {
        this.idx = idx;
      }
    }

    const ma = new MemoryTest("ma");
    should(ma.memoryStr).be.eql({id: "ina"});
    should(ma["_memoryStr"]).be.eql({id: "ina"});
    should(global["Memory"]).be.eql({
      memoryTest: {
        ma: {
          memoryStr: "ina",
        },
      },
    });

    ma.memoryStr = {id: "inb"};
    should(ma.memoryStr).be.eql({id: "inb"});
    should(ma["_memoryStr"]).be.eql({id: "inb"});
    should(global["Memory"]).be.eql({
      memoryTest: {
        ma: {
          memoryStr: "inb",
        },
      },
    });
  }
}
