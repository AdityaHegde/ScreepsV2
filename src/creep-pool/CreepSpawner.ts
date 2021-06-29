import {RoomBaseClass} from "../RoomBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {EventLoop} from "../events/EventLoop";
import {CreepCreatedEventHandler} from "../events/CreepCreatedEventHandler";
import {CreepPartsManager} from "./CreepPartsManager";
import {Logger} from "../utils/Logger";
import {CreepPoolStrategy} from "./creep-pool-strategy/CreepPoolStrategy";

@MemoryClass("creepSpawner")
export class CreepSpawner extends RoomBaseClass {
  public readonly creepNamePrefix: string;
  public readonly creepPartsManager: CreepPartsManager;
  public readonly creepPoolStrategy: CreepPoolStrategy;

  protected logger = new Logger("CreepSpawner");

  public constructor(
    id: string, room: Room,
    creepNamePrefix: string,
    creepPartsManager: CreepPartsManager,
    creepPoolStrategy: CreepPoolStrategy,
  ) {
    super(id, room);
    this.creepNamePrefix = creepNamePrefix;
    this.creepPartsManager = creepPartsManager;
    this.creepPoolStrategy = creepPoolStrategy;
    this.logger.setRoom(this.room);
  }

  public spawnCreeps(currentCreepCount: number): string {
    let createdCreepName: string;
    // spawn creeps
    if (currentCreepCount < this.creepPoolStrategy.maxCreeps &&
        this.creepPartsManager.partsCost <= this.room.energyAvailable) {
      const parts = this.creepPartsManager.parts.slice();
      const spawn = _.find(Game.spawns, foundSpawn => foundSpawn.room === this.room && !foundSpawn.spawning);

      if (spawn) {
        Memory.creepNameId ??= 0;
        const creepName = `${this.creepNamePrefix}${Memory.creepNameId}`;
        const retCode = spawn.spawnCreep(parts as any, creepName);
        if (retCode === OK) {
          Memory.creeps[creepName] = {
            power: this.creepPartsManager.power,
          };
          Memory.creepNameId++;
          EventLoop.getEventLoop().addEvent(CreepCreatedEventHandler.getEvent(
            this.room.name, creepName, this.id,
          ));
          this.logger.log(`Creep created. name=${creepName}`);
          createdCreepName = creepName;
        } else {
          this.logger.log(`Creep creation failed. name=${creepName} code=${retCode}`);
        }
      }
    } else {
      // this.logger.log("Not spawning creeps");
    }

    return createdCreepName;
  }
}
