import {EventLoop} from "../events/EventLoop";
import {Globals} from "../globals/Globals";
import {RoomRunner} from "./RoomRunner";
import {Logger} from "../utils/Logger";

export class GameRunner {
  public readonly eventLoop: EventLoop;
  public readonly roomRunnerFactory: (room: Room) => RoomRunner;

  protected readonly logger = new Logger("GameRunner");

  public constructor(eventLoop: EventLoop, roomRunnerFactory: (room: Room) => RoomRunner) {
    this.eventLoop = eventLoop;
    this.roomRunnerFactory = roomRunnerFactory;
  }

  public run(): void {
    this.logger.log(`tick=${Game.time}`);

    const roomRunners = new Array<RoomRunner>();

    Object.values(Game.rooms).forEach((room) => {
      if (!room.controller.my) {
        return;
      }

      const roomRunner = Globals.getGlobal<RoomRunner>(RoomRunner as any, room.name, () => this.roomRunnerFactory(room));

      if (!room.memory.initialised) {
        roomRunner.init();
      }

      roomRunners.push(roomRunner);
    });

    roomRunners.forEach(roomRunner => roomRunner.preTick());
    this.eventLoop.preTick();
    roomRunners.forEach(roomRunner => roomRunner.tick());
    roomRunners.forEach(roomRunner => roomRunner.postTick());
    this.eventLoop.postTick();
  }
}
