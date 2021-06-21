import {BaseClass, BaseClassMemory} from "../BaseClass";
import {JobAssigner} from "../job/JobAssigner";
import {EventLoop} from "../events/EventLoop";
import {Logger} from "../utils/Logger";

export interface RoomRunnerMemory extends BaseClassMemory {}

export interface RoomRunnerOpts {
  jobAssigner: JobAssigner;
  eventLoop: EventLoop;
}

@BaseClass.Class("runner")
export class RoomRunner extends BaseClass<RoomRunnerMemory, RoomRunnerOpts> {
  public readonly jobAssigner: JobAssigner;
  public readonly eventLoop: EventLoop;

  protected logger = new Logger("RoomRunner");

  public init(room: Room): void {
    this.logger.setRoom(room).log("init");
    this.jobAssigner.init(room);
    room.memory.initialised = true;
  }

  public preTick(room: Room): void {
    this.logger.setRoom(room).log("preTick");
    this.eventLoop.preTick();
    this.jobAssigner.preTick(room);
  }

  public tick(room: Room): void {
    this.logger.setRoom(room).log(`${room.energyAvailable}/${room.energyCapacityAvailable}`);
    this.jobAssigner.tick(room);
  }

  public postTick(room: Room): void {
    // this.logger.setRoom(room).log("postTick");
    this.jobAssigner.postTick(room);
    this.eventLoop.postTick();
  }
}
