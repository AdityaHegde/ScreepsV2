import {RoomBaseClass} from "../RoomBaseClass";
import {JobAssigner} from "../job/JobAssigner";
import {Logger} from "../utils/Logger";
import {MemoryClass} from "@memory/MemoryClass";
import {ROOM_RUNNER_ID} from "../constants";
import {getIdFromRoom} from "../utils/getIdFromRoom";
import {ColonyBuildings} from "../building/ColonyBuildings";

@MemoryClass("runner")
export class ColonyRunner extends RoomBaseClass {
  public readonly jobAssigner: JobAssigner;
  public readonly colonyBuildings: ColonyBuildings;

  public constructor(
    id: string, room: Room,
    jobAssigner: JobAssigner, colonyBuildings: ColonyBuildings,
  ) {
    super(id, room);
    this.jobAssigner = jobAssigner;
    this.colonyBuildings = colonyBuildings;
    this.logger.setRoom(this.room);
  }

  protected logger = new Logger("ColonyRunner");

  public init(): void {
    this.logger.log("init");
    this.jobAssigner.init();
    this.colonyBuildings.init();
    this.room.memory.initialised = true;
  }

  public preTick(): void {
    // this.logger.log("preTick");
    this.jobAssigner.preTick();
  }

  public tick(): void {
    // this.logger.log(`${this.room.energyAvailable}/${this.room.energyCapacityAvailable}`);
    this.colonyBuildings.run();
    this.jobAssigner.tick();
  }

  public postTick(): void {
    // this.logger.log("postTick");
    this.jobAssigner.postTick();
  }

  public static getRoomRunner(
    room: Room, jobAssigner: JobAssigner, colonyBuildings: ColonyBuildings,
  ): ColonyRunner {
    return new ColonyRunner(getIdFromRoom(room, ROOM_RUNNER_ID), room, jobAssigner, colonyBuildings);
  }
}