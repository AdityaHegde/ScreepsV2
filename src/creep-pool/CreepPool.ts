import {ColonyBaseClass} from "../ColonyBaseClass";
import {EventLoop} from "../events/EventLoop";
import {Logger} from "../utils/Logger";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {CreepCreatedEventHandler} from "../events/CreepCreatedEventHandler";
import {CreepPartsManager} from "./CreepPartsManager";
import {CreepSpawner} from "./CreepSpawner";
import {CreepPoolStrategy} from "./creep-pool-strategy/CreepPoolStrategy";

@MemoryClass("creepPool")
export class CreepPool extends ColonyBaseClass {
  public readonly creepPartsManager: CreepPartsManager;
  public readonly creepSpawner: CreepSpawner;
  public readonly creepPoolStrategy: CreepPoolStrategy;

  @inMemory(() => [])
  public creeps: Array<string>;

  protected logger = new Logger("CreepPool");

  public constructor(
    id: string, room: Room,
    creepPartsManager: CreepPartsManager,
    creepSpawner: CreepSpawner,
    creepPoolStrategy: CreepPoolStrategy,
  ) {
    super(id, room);
    this.creepPartsManager = creepPartsManager;
    this.creepSpawner = creepSpawner;
    this.creepPoolStrategy = creepPoolStrategy;
    this.logger.setRoom(this.room);
  }

  public init(): void {
    this.creepPoolStrategy.init();
  }

  public preTick(): void {
    this.creepPartsManager.upgradeParts();
  }

  public tick(creepCallback: (creep: Creep) => void, deadCreepCallback: (creepMemory: CreepMemory) => void): void {
    this.forEachCreep(creepCallback, deadCreepCallback);
  }

  public postTick(): void {
    const addedCreepName = this.creepSpawner.spawnCreeps(this.creeps.length);
    if (addedCreepName) {
      this.creeps.push(addedCreepName);
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
