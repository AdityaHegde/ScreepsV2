import {MemoryMockTestBase} from "./MemoryMockTestBase";
import {TestBase} from "./TestBase";
import {GameMocks} from "./game-mocks/GameMocks";
import {Globals} from "@globals/Globals";
import {EventLoop} from "../../src/events/EventLoop";

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
    EventLoop.getEventLoop().preTick();
  }
}
