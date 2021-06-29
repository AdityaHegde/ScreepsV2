import {RoomBaseClass} from "../RoomBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {Logger} from "../utils/Logger";
import {CreepPoolStrategy} from "./creep-pool-strategy/CreepPoolStrategy";

@MemoryClass("creepParts")
export class CreepPartsManager extends RoomBaseClass {
  public readonly initParts: Array<BodyPartConstant>;
  public readonly creepParts: Array<BodyPartConstant>;
  public readonly powerPart: BodyPartConstant;
  public readonly addMove: boolean;

  public readonly creepPoolStrategy: CreepPoolStrategy;

  @inMemory(function (this: CreepPartsManager) {
    return _.cloneDeep(this.initParts);
  })
  public parts: Array<BodyPartConstant>;

  @inMemory(function (this: CreepPartsManager) {
    return this.initParts.reduce((partsCost, part) => partsCost + BODYPART_COST[part], 0);
  })
  public partsCost: number;

  @inMemory(() => 0)
  public partsIdx: number;

  @inMemory(() => 0)
  public lastCapacity: number;

  @inMemory(function (this: CreepPartsManager) {
    return this.initParts.reduce((power, part) =>
      power + (part === this.powerPart ? 1 : 0), 0);
  })
  public power: number;

  protected logger = new Logger("CreepPartsManager");

  public constructor(
    id: string, room: Room,
    initParts: Array<BodyPartConstant>, creepParts: Array<BodyPartConstant>,
    powerPart: BodyPartConstant, addMove: boolean,
    creepPoolStrategy: CreepPoolStrategy,
  ) {
    super(id, room);
    this.initParts = initParts;
    this.creepParts = creepParts;
    this.powerPart = powerPart;
    this.addMove = addMove;
    this.creepPoolStrategy = creepPoolStrategy;
    this.logger.setRoom(this.room);
  }

  public upgradeParts(): void {
    if (this.lastCapacity === this.room.energyCapacityAvailable) {
      return;
    }

    let newPart = this.creepParts[this.partsIdx];
    let newPartCost = BODYPART_COST[newPart] + (this.addMove ? BODYPART_COST[MOVE] : 0);

    this.logger.log(`Capacity: ${this.room.energyCapacityAvailable}. ` +
      `Parts Cost: ${this.partsCost}. New Cost: ${newPartCost}`);

    // if the available energy capacity can accommodate the new part or if the parts has reached max parts count (50)
    while (this.room.energyCapacityAvailable >= (this.partsCost + newPartCost) &&
           this.power <= this.creepPoolStrategy.maxPowerPartCount - 1) {

      // have the new part at the beginning and move at the end,
      // so that when the creep is damaged movement is the last thing to be damaged
      this.parts.unshift(newPart);
      if (this.addMove) {
        this.parts.push(MOVE);
      }
      this.partsCost += BODYPART_COST[newPart] + (this.addMove ? BODYPART_COST[MOVE] : 0);
      this.partsIdx = (this.partsIdx + 1) % this.creepParts.length;
      this.power += (newPart === this.powerPart ? 1 : 0);

      this.logger.log("Upgraded the creeps parts to", this.parts.join(","));

      newPart = this.creepParts[this.partsIdx];
      newPartCost = BODYPART_COST[newPart] + (this.addMove ? BODYPART_COST[MOVE] : 0)
    }

    this.lastCapacity = this.room.energyCapacityAvailable;
  }
}
