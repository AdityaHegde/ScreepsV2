import {BaseClass} from "../../BaseClass";
import {CreepPoolInstance} from "./CreepPoolInstance";
import {CreepPoolMemory} from "./CreepPoolMemory";
import {Globals} from "../../globals/Globals";
import {EVENT_LOOP_ID} from "../../constants";
import {EventLoop} from "../../events/EventLoop";
import {Logger} from "../../utils/Logger";

export interface CreepPoolOpts {
  maxCount: number;
  creepNamePrefix: string;

  initParts: Array<BodyPartConstant>;
  creepParts: Array<BodyPartConstant>;
  powerPart: BodyPartConstant;
  addMove: boolean;
  maxParts: number;
}

@BaseClass.Class("creepPool")
export class CreepPool extends BaseClass<CreepPoolMemory, CreepPoolOpts> {
  protected readonly maxCount: number;
  protected readonly creepNamePrefix: string;

  protected readonly initParts: Array<BodyPartConstant>;
  protected readonly creepParts: Array<BodyPartConstant>;
  protected readonly powerPart: BodyPartConstant;
  protected readonly addMove: boolean;
  protected readonly maxParts: number;

  protected logger = new Logger("CreepPool");

  public preTick(room: Room): void {
    this.upgradeParts(this.getInstanceFromRoom(room), room);
  }

  public tick(room: Room, creepCallback: (creep: Creep) => void): void {
    this.forEachCreep(this.getInstanceFromRoom(room), creepCallback);
  }

  public postTick(room: Room): void {
    this.spawnCreeps(this.getInstanceFromRoom(room), room);
  }

  protected getBlankMemory(id: string): CreepPoolMemory {
    return {
      id,

      parts: _.cloneDeep(this.initParts),
      partsCost: this.initParts.reduce(
        (partsCost, part) => partsCost + BODYPART_COST[part], 0),
      partsIdx: 0,

      creeps: [],
      power: this.initParts.reduce((power, part) =>
        power + (part === this.powerPart ? 1 : 0), 0),
    };
  }

  protected upgradeParts(creepPoolInstance: CreepPoolInstance, room: Room): void {
    let newPart = this.creepParts[creepPoolInstance.memory.partsIdx];
    let newPartCost = BODYPART_COST[newPart] + (this.addMove ? BODYPART_COST[MOVE] : 0);

    // this.logger.setRoom(room).log("[Upgrade Parts]", `Capacity: ${this.controllerRoom.room.energyCapacityAvailable}. ` +
    //   `Parts Cost: ${this.partsCost}. New Cost: ${this.partsCost + BODYPART_COST[newPart] +
    //     (this.addMove ? BODYPART_COST[MOVE] : 0)}`);

    // if the available energy capacity can accommodate the new part or if the parts has reached max parts count (50)
    while (room.energyCapacityAvailable >= (creepPoolInstance.memory.partsCost + newPartCost) &&
    creepPoolInstance.memory.parts.length <= this.maxParts - 1 - (this.addMove ? 1 : 0)) {

      // have the new part at the beginning and move at the end,
      // so that when the creep is damaged movement is the last thing to be damaged
      creepPoolInstance.memory.parts.unshift(newPart);
      if (this.addMove) {
        creepPoolInstance.memory.parts.push(MOVE);
      }
      creepPoolInstance.memory.partsCost += BODYPART_COST[newPart] + (this.addMove ? BODYPART_COST[MOVE] : 0);
      creepPoolInstance.memory.partsIdx = (creepPoolInstance.memory.partsIdx + 1) % this.creepParts.length;
      creepPoolInstance.memory.power += (newPart === this.powerPart ? 1 : 0);

      // this.logger.setRoom(room).log("Upgraded the creeps parts to", this.parts.join(","));

      newPart = this.creepParts[creepPoolInstance.memory.partsIdx];
      newPartCost = BODYPART_COST[newPart] + (this.addMove ? BODYPART_COST[MOVE] : 0)
    }
  }

  protected spawnCreeps(creepPoolInstance: CreepPoolInstance, room: Room): void {
    // spawn creeps
    if (creepPoolInstance.memory.creeps.length < this.maxCount &&
      creepPoolInstance.memory.partsCost <= room.energyAvailable) {
      const parts = creepPoolInstance.memory.parts.slice();
      const spawn = _.find(Game.spawns, foundSpawn => foundSpawn.room === room && !foundSpawn.spawning);

      if (spawn) {
        Memory.creepNameId ??= 0;
        const creepName = `${this.creepNamePrefix}${Memory.creepNameId}`;
        const retCode = spawn.spawnCreep(parts as any, creepName);
        if (retCode === OK) {
          creepPoolInstance.memory.creeps.push(creepName);
          Memory.creeps[creepName] = {
            power: creepPoolInstance.memory.power,
          };
          Memory.creepNameId++;
          Globals.getGlobalSingleton<EventLoop>(EVENT_LOOP_ID).addEvent({
            type: "creepCreated",
            creepName, roomName: room.name, creepPool: this.idSuffix,
          });
          this.logger.setRoom(room).log(`Creep created. name=${creepName}`);
        } else {
          this.logger.setRoom(room).log(`Creep creation failed. name=${creepName} code=${retCode}`);
        }
      }
    } else {
      // this.logger.setRoom(room).log("Not spawning creeps");
    }
  }

  protected forEachCreep(creepPoolInstance: CreepPoolInstance, creepCallback: (creep: Creep) => void): void {
    const deadCreepNames = new Array<string>();

    creepPoolInstance.memory.creeps = creepPoolInstance.memory.creeps.filter((creepId) => {
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
