import {EventLoop} from "../events/EventLoop";
import {Globals} from "../globals/Globals";
import {ColonyRunner} from "./ColonyRunner";
import {Logger} from "../utils/Logger";

export class GameRunner {
  public readonly eventLoop: EventLoop;
  public readonly colonyRunnerFactory: (room: Room) => ColonyRunner;

  protected readonly logger = new Logger("GameRunner");

  public constructor(eventLoop: EventLoop, colonyRunnerFactory: (room: Room) => ColonyRunner) {
    this.eventLoop = eventLoop;
    this.colonyRunnerFactory = colonyRunnerFactory;
  }

  public run(): void {
    const roomRunners = new Array<ColonyRunner>();

    Object.values(Game.rooms).forEach((room) => {
      if (!room.controller.my) {
        return;
      }

      const roomRunner = Globals.getGlobal<ColonyRunner>(ColonyRunner as any, room.name, () => this.colonyRunnerFactory(room));

      if (!roomRunner.init()) {
        roomRunners.push(roomRunner);
      }
    });

    this.logger.log(`pre tick=${Game.time}`);
    roomRunners.forEach(roomRunner => roomRunner.preTick());
    this.eventLoop.preTick();
    this.logger.log(`tick=${Game.time}`);
    roomRunners.forEach(roomRunner => roomRunner.tick());
    this.logger.log(`post tick=${Game.time}`);
    roomRunners.forEach(roomRunner => roomRunner.postTick());
    this.eventLoop.postTick();
  }

  public static getGameRunner(colonyRunnerFactory: (room: Room) => ColonyRunner): GameRunner {
    return new GameRunner(EventLoop.getEventLoop(), colonyRunnerFactory);
  }
}
