import {ColonyBaseClass} from "../ColonyBaseClass";
import {Logger} from "@utils/Logger";
import {MemoryClass} from "@memory/MemoryClass";
import {DEPOSIT_ID, ROOM_RUNNER_ID} from "../constants";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {ColonyBuildings} from "../building/ColonyBuildings";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {CreepSpawnQueue} from "@wrappers/creeps-spawner/CreepSpawnQueue";
import {GroupRunner} from "./GroupRunner";
import {ColonyPlanner} from "../colony-planner/ColonyPlanner";
import {getWrapperById} from "@wrappers/getWrapperById";
import {GameEntity} from "@wrappers/GameEntity";
import {Globals} from "@globals/Globals";
import {WeightedGroup} from "@wrappers/group/WeightedGroup";
import {addToHaulNetwork} from "@factory/jobNetworkFactory";

@MemoryClass("runner")
export class ColonyRunner extends ColonyBaseClass {
  public readonly colonyPlanner: ColonyPlanner;
  public readonly groupRunner: GroupRunner;
  public readonly colonyBuildings: ColonyBuildings;
  public readonly pathFinder: ColonyPathFinder;
  public readonly creepSpawnQueue: CreepSpawnQueue;

  public constructor(
    id: string, room: Room,
    groupRunner: GroupRunner, colonyBuildings: ColonyBuildings,
    pathFinder: ColonyPathFinder, creepSpawnQueue: CreepSpawnQueue,
  ) {
    super(id, room);
    this.colonyPlanner = colonyBuildings.colonyPlanner;
    this.groupRunner = groupRunner;
    this.colonyBuildings = colonyBuildings;
    this.pathFinder = pathFinder;
    this.creepSpawnQueue = creepSpawnQueue;
    this.logger.setRoom(this.room);
  }

  protected logger = new Logger("ColonyRunner");

  public init(): boolean {
    if (this.room.memory.initialised && this.room.memory.planned) return false;
    this.logger.log("init");

    if (!this.room.memory.initialised) {
      if (this.colonyPlanner.init()) {
        this.room.memory.initialised = true;
      }
    } else {
      if (!this.colonyPlanner.plan()) {
        this.room.memory.planned = true;
        this.creepSpawnQueue.init();
        this.groupRunner.init();
        addToHaulNetwork(this.room);
      }
    }

    return true;
  }

  public preTick(): void {
    // this.logger.log("preTick");
    this.pathFinder.preTick();
    this.creepSpawnQueue.preTick();
    this.groupRunner.preTick();
  }

  public tick(): void {
    // this.logger.log(`${this.room.energyAvailable}/${this.room.energyCapacityAvailable}`);
    this.colonyBuildings.run();
    this.groupRunner.tick();
    this.creepSpawnQueue.tick();
    this.updateSpawnWeights();
  }

  public postTick(): void {
    // this.logger.log("postTick");
    this.pathFinder.postTick();
    this.groupRunner.postTick();
  }

  public static getRoomRunner(
    room: Room, groupRunner: GroupRunner, colonyBuildings: ColonyBuildings,
    pathFinder: ColonyPathFinder, creepSpawnQueue: CreepSpawnQueue,
  ): ColonyRunner {
    return new ColonyRunner(getIdFromRoom(room, ROOM_RUNNER_ID), room, groupRunner, colonyBuildings,
      pathFinder, creepSpawnQueue);
  }

  private updateSpawnWeights() {
    const depositPool = Globals.getGlobal<WeightedGroup>(WeightedGroup, getIdFromRoom(this.room, DEPOSIT_ID));
    this.creepSpawnQueue.spawnIds.forEach((spawnId) => {
      const spawnEntityWrapper = getWrapperById(spawnId) as GameEntity<StructureSpawn>;
      if (spawnEntityWrapper.entity.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return;
      depositPool.updateCurrentWeight(spawnEntityWrapper, -1,
        spawnEntityWrapper.entity.store.getCapacity(RESOURCE_ENERGY));
      this.logger.log(`spawnId=${spawnId} energy=${spawnEntityWrapper.entity.store[RESOURCE_ENERGY]} ` +
        `weight=${depositPool.weights[spawnId].toString()}`);
    });
  }
}
