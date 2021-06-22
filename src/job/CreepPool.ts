import {BaseClass} from "../BaseClass";
import {EventLoop} from "../events/EventLoop";
import {Logger} from "../utils/Logger";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";

@MemoryClass("creepPool")
export class CreepPool extends BaseClass {
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
  }

  public preTick(): void {
    this.upgradeParts();
  }

  public tick(creepCallback: (creep: Creep) => void): void {
    this.forEachCreep(creepCallback);
  }

  public postTick(): void {
    this.spawnCreeps();
  }

  protected upgradeParts(): void {
    let newPart = this.creepParts[this.partsIdx];
    let newPartCost = BODYPART_COST[newPart] + (this.addMove ? BODYPART_COST[MOVE] : 0);

    // this.logger.setRoom(room).log("[Upgrade Parts]", `Capacity: ${this.room.energyCapacityAvailable}. ` +
    //   `Parts Cost: ${this.partsCost}. New Cost: ${newPartCost}`);

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

      // this.logger.setRoom(room).log("Upgraded the creeps parts to", this.parts.join(","));

      newPart = this.creepParts[this.partsIdx];
      newPartCost = BODYPART_COST[newPart] + (this.addMove ? BODYPART_COST[MOVE] : 0)
    }
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
          EventLoop.getEventLoop().addEvent({
            type: "creepCreated",
            creepName, creepPoolId: this.id, roomName: this.room.name,
          });
          this.logger.setRoom(this.room).log(`Creep created. name=${creepName}`);
        } else {
          this.logger.setRoom(this.room).log(`Creep creation failed. name=${creepName} code=${retCode}`);
        }
      }
    } else {
      // this.logger.setRoom(room).log("Not spawning creeps");
    }
  }

  protected forEachCreep(creepCallback: (creep: Creep) => void): void {
    const deadCreepNames = new Array<string>();

    this.creeps = this.creeps.filter((creepId) => {
      const creep = Game.creeps[creepId];

      if (!creep) {
        deadCreepNames.push(creep.name);
        return false;
      }

      if (!creep.spawning) {
        creepCallback(creep);
      }

      return true;
    });

    deadCreepNames.forEach((deadCreepId) => {
      if (Memory.creeps[deadCreepId]) {
        delete Memory.creeps[deadCreepId];
      }
    });
  }
}
