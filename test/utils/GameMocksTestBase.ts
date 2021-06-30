import {MemoryMockTestBase} from "./MemoryMockTestBase";
import {TestBase} from "./TestBase";
import {GameMocks} from "./GameMocks";
import {Globals} from "../../src/globals/Globals";

export class GameMocksTestBase extends MemoryMockTestBase {
  public gameMocks: GameMocks;

  @TestBase.BeforeSuite()
  public setupGameMocks(): void {
    this.gameMocks = new GameMocks(this.sandbox);
  }

  @TestBase.BeforeEachTest()
  public setupGameMocksTest(): void {
    this.gameMocks.init();
    Globals.init();
  }
}
