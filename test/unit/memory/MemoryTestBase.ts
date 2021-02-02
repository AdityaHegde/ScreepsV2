import { TestBase } from "../../test-utils/TestBase";

export class MemoryTestBase extends TestBase {
  @TestBase.BeforeEachTest()
  public setupTest() {
    global["Memory"] = {};
  }
}
