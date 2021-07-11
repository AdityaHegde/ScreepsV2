import {MemoryClass} from "@memory/MemoryClass";
import {ColonyBaseClass} from "../ColonyBaseClass";
import {inMemory} from "@memory/inMemory";
import {ArrayPos, BuildingPlan} from "../preprocessing/Prefab";
import {
  BuildingPrefabTypeToTypeMap,
  WALKABLE_BUILDING_TYPES
} from "../preprocessing/ParserMetadata";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {COLONY_PLAN_ID, DEPOSIT_ID, ROOM_MAX_X, ROOM_MAX_Y} from "../constants";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {BunkerPlanner} from "./BunkerPlanner";
import {RoadPlanner} from "./RoadPlanner";
import {Logger} from "@utils/Logger";
import {Globals} from "@globals/Globals";
import {EntityPool} from "../entity-group/entity-pool/EntityPool";
import {getWrapperById} from "@wrappers/getWrapperById";
import {EntityWrapper} from "@wrappers/EntityWrapper";

@MemoryClass("plan")
export class ColonyPlanner extends ColonyBaseClass {
  @inMemory(() => [])
  public rclPrefabs: Array<Array<BuildingPlan>>;

  @inMemory(() => [])
  public rawCostMatrix: Array<number>;
  public costMatrix: CostMatrix;
  @inMemory()
  public center: ArrayPos;

  @inMemory(() => 2)
  public stage: number;

  public positionDedupe = new Set<string>();

  public readonly pathFinder: ColonyPathFinder;

  protected logger = new Logger("ColonyPlanner");

  public constructor(id: string, room: Room, pathFinder: ColonyPathFinder) {
    super(id, room);
    this.pathFinder = pathFinder;
  }

  public init(): boolean {
    // TODO: do automatic placement
    const spawn = this.room.find(FIND_MY_SPAWNS)[0];

    if (!spawn) {
      return false;
    }
    const spawnEntityWrapper = getWrapperById(spawn.id) as EntityWrapper<StructureSpawn>;
    // adding a weight buffer to account for regen. TODO: do this in a better way
    Globals.getGlobal<EntityPool>(EntityPool as any, getIdFromRoom(this.room, DEPOSIT_ID))
      .addEntityWrapper(spawnEntityWrapper, 0);

    this.center = [spawn.pos.x, spawn.pos.y];
    this.costMatrix = new PathFinder.CostMatrix();

    const roomTerrain = new Room.Terrain(this.room.name);
    for (let x = 0; x < ROOM_MAX_X; x++) {
      for (let y = 0; y < ROOM_MAX_Y; y++) {
        const tile = roomTerrain.get(x, y);
        const weight = tile === TERRAIN_MASK_WALL ? 255 :
          tile === TERRAIN_MASK_SWAMP ? 5 : 1;
        this.costMatrix.set(x, y, weight);
      }
    }

    BunkerPlanner.getBunkerPlan().plan(this);

    this.rawCostMatrix = this.costMatrix.serialize();

    return true;
  }

  public plan(): boolean {
    if (this.stage === 0) return false;
    this.logger.log(`Planning stage=${this.stage}`);
    this.costMatrix = PathFinder.CostMatrix.deserialize(this.rawCostMatrix);
    switch (this.stage) {
      case 1: RoadPlanner.getSourceRoadPlans(this).forEach(roadPlanner => roadPlanner.plan(this)); break;
      case 2: RoadPlanner.getControllerPlan(this).plan(this); break;
    }
    this.stage--;
    if (this.stage === 0) {
      this.rawCostMatrix = undefined;
      return false;
    }
    this.rawCostMatrix = this.costMatrix.serialize();
    return true;
  }

  public addBuildingPos(
    buildingPlan: BuildingPlan, buildingPos: ArrayPos,
  ): void {
    const posForRoom: ArrayPos = [...buildingPos];

    const dedupeKey = `${buildingPlan[0]}-${posForRoom[0]}-${posForRoom[1]}`;
    if (this.positionDedupe.has(dedupeKey)) {
      return;
    }
    this.positionDedupe.add(dedupeKey);

    buildingPlan[1].push(posForRoom);
    if (!(BuildingPrefabTypeToTypeMap[buildingPlan[0]] in WALKABLE_BUILDING_TYPES)) {
      this.costMatrix.set(posForRoom[0], posForRoom[1], 255);
    }
  }

  public static getColonyPlan(room: Room, colonyPathFinder: ColonyPathFinder): ColonyPlanner {
    return new ColonyPlanner(getIdFromRoom(room, COLONY_PLAN_ID), room, colonyPathFinder);
  }
}
