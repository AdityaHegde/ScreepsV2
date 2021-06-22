import {BaseClass} from "../BaseClass";
import {JobAssigner} from "../job/JobAssigner";
import {EventLoop} from "../events/EventLoop";
import {Logger} from "../utils/Logger";
import {MemoryClass} from "@memory/MemoryClass";
import {Globals} from "../globals/Globals";
import {ROOM_RUNNER_ID} from "../constants";
import {getIdFromRoom} from "../utils/getIdFromRoom";

@MemoryClass("runner")
export class RoomRunner extends BaseClass {
  public readonly jobAssigner: JobAssigner;

  public constructor(
    id: string, room: Room,
    jobAssigner: JobAssigner,
  ) {
    super(id, room);
    this.jobAssigner = jobAssigner;
  }

  protected logger = new Logger("RoomRunner");

  public init(): void {
    this.logger.setRoom(this.room).log("init");
    this.jobAssigner.init();
    this.room.memory.initialised = true;
  }

  public preTick(): void {
    // this.logger.setRoom(this.room).log("preTick");
    this.jobAssigner.preTick();
  }

  public tick(): void {
    // this.logger.setRoom(this.room).log(`${this.room.energyAvailable}/${this.room.energyCapacityAvailable}`);
    this.jobAssigner.tick();
  }

  public postTick(): void {
    // this.logger.setRoom(this.room).log("postTick");
    this.jobAssigner.postTick();
  }

  public static getRoomRunner(room: Room, jobAssigner: JobAssigner): RoomRunner {
    return new RoomRunner(getIdFromRoom(room, ROOM_RUNNER_ID), room, jobAssigner);
  }
}
