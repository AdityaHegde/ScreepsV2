import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {ColonyBaseClass} from "../../ColonyBaseClass";
import {CreepGroup} from "../group/CreepGroup";
import {CreepSpawnQueueEntry} from "./CreepSpawnQueue";
import {Logger} from "@utils/Logger";
import {GROUPS_MEMORY_NAME} from "../../constants";

export interface CreepsManagerOpts {
  matchMove: boolean;
  matchCarry: boolean;
  mainPart: BodyPartConstant;
  initParts: Array<BodyPartConstant>;
  initMainPartsCount: number;
  maxMainPartsCount: number;
  maxCreeps: number;
}

@MemoryClass(GROUPS_MEMORY_NAME)
export class CreepsSpawner extends ColonyBaseClass {
  @inMemory(() => 0)
  public mainPartsCount: number;
  @inMemory()
  public currentCost: number;
  @inMemory()
  public lastCapacity: number;
  @inMemory(() => 0)
  public queuedCreepNumber: number;
  @inMemory(() => 0)
  public maxMainPartsCount: number;

  public creepGroup: CreepGroup;

  public mainPart: BodyPartConstant;
  public matchMove: boolean;
  public matchCarry: boolean;
  public initParts: Array<BodyPartConstant>;
  public initMainPartsCount: number;
  public maxCreeps: number;

  protected logger = new Logger("CreepsSpawner");

  public constructor(
    id: string, room: Room,
    {
      mainPart, matchMove, matchCarry,
      initParts, initMainPartsCount, maxMainPartsCount, maxCreeps,
    }: CreepsManagerOpts,
  ) {
    super(id, room);

    this.matchMove = matchMove;
    this.matchCarry = matchCarry;
    this.mainPart = mainPart;
    this.initParts = initParts;
    this.initMainPartsCount = initMainPartsCount;
    if (maxMainPartsCount) this.maxMainPartsCount = maxMainPartsCount;
    this.maxCreeps = maxCreeps;
  }

  public init(): void {
    this.lastCapacity = this.room.energyCapacityAvailable;
    this.currentCost = this.getBodyPartsCost(this.getBodyParts());
  }

  public updateBodyParts(): void {
    if (this.lastCapacity === this.room.energyCapacityAvailable ||
      (this.mainPartsCount + this.initMainPartsCount) === this.maxMainPartsCount) return;

    const newCost = this.currentCost + BODYPART_COST[this.mainPart] +
      (this.matchMove ? BODYPART_COST[MOVE] : 0) + (this.matchCarry ? BODYPART_COST[CARRY] : 0);

    if (newCost <= this.room.energyCapacityAvailable) {
      this.mainPartsCount++;
    }
    this.lastCapacity = this.room.energyCapacityAvailable;
  }

  public shouldSpawnCreeps(): boolean {
    return this.creepGroup.entityWrapperIds.length < this.maxCreeps;
  }

  // TODO: cache this
  public getBodyParts(mainParts = this.mainPartsCount): Array<BodyPartConstant> {
    const bodyParts = this.initParts;
    for (let i = 0; i < mainParts; i++) {
      bodyParts.push(this.mainPart);
      if (this.matchMove) bodyParts.push(MOVE);
      if (this.matchCarry) bodyParts.push(CARRY);
    }
    return bodyParts;
  }

  public getSpawnQueueEntry(): CreepSpawnQueueEntry {
    this.queuedCreepNumber++;
    return [this.id, this.getBodyPartsCost(this.getBodyParts()), this.mainPartsCount];
  }

  protected getBodyPartsCost(bodyParts: Array<BodyPartConstant>): number {
    return bodyParts.reduce((cost, bodyPart) => cost + BODYPART_COST[bodyPart], 0)
  }
}
