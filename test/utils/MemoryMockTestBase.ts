import {TestBase} from "./TestBase";

export class MemoryMockTestBase extends TestBase {
  protected memory: Memory;

  @TestBase.BeforeEachTest()
  public setupMemoryMock(): void {
    this.memory = {
      creeps: {}, powerCreeps: {}, rooms: {}, spawns: {}, flags: {},
    };
    (global as any).Memory = this.memory;
  }

  @TestBase.AfterEachTest()
  public teardownMemoryMock(): void {
    delete (global as any).Memory;
  }
}
