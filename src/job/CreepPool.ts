import {RoomBaseClass} from "../RoomBaseClass";
import {EventLoop} from "../events/EventLoop";
import {Logger} from "../utils/Logger";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {CreepCreatedEventHandler} from "../events/CreepCreatedEventHandler";

@MemoryClass("creepPool")
export class CreepPool extends RoomBaseClass {
  public readonly maxCount: number;
  public readonly creepNamePrefix: string;

  public readonly initParts: Array<BodyPartConstant>;
  public readonly creepParts: Array<BodyPartConstant>;
  public readonly powerPart: BodyPartConstant;
  public readonly addMove: boolean;
  public readonly maxParts: number;

  @inMemory(function (this: CreepPool) {
    return _.cloneDeep(this.initParts);
  })
  public parts: Array<BodyPartConstant>;

  @inMemory(function (this: CreepPool) {
    return this.initParts.reduce((partsCost, part) => partsCost + BODYPART_COST[part], 0);
  })
  public partsCost: number;

  @inMemory(() => 0)
  public partsIdx: number;

  @inMemory(() => [])
  public creeps: Array<string>;

  @inMemory(() => 0)
  public lastCapacity: number;

  @inMemory(function (this: CreepPool) {
    return this.initParts.reduce((power, part) =>
      power + (part === this.powerPart ? 1 : 0), 0);
  })
  public power: number;

  protected logger = new Logger("CreepPool");

  public constructor(
    id: string, room: Room,
    maxCount: number, creepNamePrefix: string,
    initParts: Array<BodyPartConstant>, creepParts: Array<BodyPartConstant>,
    powerPart: BodyPartConstant, addMove: boolean, maxParts: number,
  ) {
    super(id, room);
    this.maxCount = maxCount;
    this.creepNamePrefix = creepNamePrefix;
    this.initParts = initParts;
    this.creepParts = creepParts;
    this.powerPart = powerPart;
    this.addMove = addMove;
    this.maxParts = maxParts;
    this.logger.setRoom(this.room);
  }

  public preTick(): void {
    if (!this.lastCapacity || this.lastCapacity > this.room.energyCapacityAvailable) {
      this.upgradeParts();
    }
  }

  public tick(creepCallback: (creep: Creep) => void, deadCreepCallback: (creepMemory: CreepMemory) => void): void {
    this.forEachCreep(creepCallback, deadCreepCallback);
  }

  public postTick(): void {
    this.spawnCreeps();
  }

  protected upgradeParts(): void {
    if (this.lastCapacity === this.room.energyCapacityAvailable) {
      return;
    }

    let newPart = this.creepParts[this.partsIdx];
    let newPartCost = BODYPART_COST[newPart] + (this.addMove ? BODYPART_COST[MOVE] : 0);

    this.logger.log("[Upgrade Parts]", `Capacity: ${this.room.energyCapacityAvailable}. ` +
      `Parts Cost: ${this.partsCost}. New Cost: ${newPartCost}`);

    // if the available energy capacity can accommodate the new part or if the parts has reached max parts count (50)
    while (this.room.energyCapacityAvailable >= (this.partsCost + newPartCost) &&
           this.parts.length <= this.maxParts - 1 - (this.addMove ? 1 : 0)) {

      // have the new part at the beginning and move at the end,
      // so that when the creep is damaged movement is the last thing to be damaged
      this.parts.unshift(newPart);
      if (this.addMove) {
        this.parts.push(MOVE);
      }
      this.partsCost += BODYPART_COST[newPart] + (this.addMove ? BODYPART_COST[MOVE] : 0);
      this.partsIdx = (this.partsIdx + 1) % this.creepParts.length;
      this.power += (newPart === this.powerPart ? 1 : 0);

      // this.logger.log("Upgraded the creeps parts to", this.parts.join(","));

      newPart = this.creepParts[this.partsIdx];
      newPartCost = BODYPART_COST[newPart] + (this.addMove ? BODYPART_COST[MOVE] : 0)
    }

    this.lastCapacity = this.room.energyCapacityAvailable;
  }

  protected spawnCreeps(): void {
    // spawn creeps
    if (this.creeps.length < this.maxCount &&
        this.partsCost <= this.room.energyAvailable) {
      const parts = this.parts.slice();
      const spawn = _.find(Game.spawns, foundSpawn => foundSpawn.room === this.room && !foundSpawn.spawning);

      if (spawn) {
        Memory.creepNameId ??= 0;
        const creepName = `${this.creepNamePrefix}${Memory.creepNameId}`;
        const retCode = spawn.spawnCreep(parts as any, creepName);
        if (retCode === OK) {
          this.creeps.push(creepName);
          Memory.creeps[creepName] = {
            power: this.power,
          };
          Memory.creepNameId++;
          EventLoop.getEventLoop().addEvent(CreepCreatedEventHandler.getEvent(
            this.room.name, creepName, this.id,
          ));
          this.logger.log(`Creep created. name=${creepName}`);
        } else {
          this.logger.log(`Creep creation failed. name=${creepName} code=${retCode}`);
        }
      }
    } else {
      // this.logger.log("Not spawning creeps");
    }
  }

  protected forEachCreep(
    creepCallback: (creep: Creep) => void, deadCreepCallback: (creepMemory: CreepMemory) => void,
  ): void {
    this.creeps = this.creeps.filter((creepName) => {
      const creep = Game.creeps[creepName];

      if (!creep) {
        deadCreepCallback(Memory.creeps[creepName]);
        delete Memory.creeps[creepName];
        return false;
      }

      if (!creep.spawning) {
        creepCallback(creep);
      }

      return true;
    });
  }
}
