import {MemoryClass} from "@memory/MemoryClass";
import {RoomBaseClass} from "../RoomBaseClass";
import {inMemory} from "@memory/inMemory";
import {ArrayPos, BuildingPlan, Prefab} from "../preprocessing/Prefab";
import {BunkerPrefab} from "../data/Bunker";
import {
  BuildingPrefabTypeToTypeMap,
  BuildingTypeToPrefabTypeMap,
  WALKABLE_BUILDING_TYPES
} from "../preprocessing/ParserMetadata";
import {getIdFromRoom} from "../utils/getIdFromRoom";
import {COLONY_PLAN_ID} from "../constants";
import {ColonyPathFinder} from "../pathfinder/ColonyPathFinder";

@MemoryClass("plan")
export class ColonyPlan extends RoomBaseClass {
  @inMemory(() => [])
  public rclPrefabs: Array<Array<BuildingPlan>>;

  public costMatrix: CostMatrix;

  public positionDedupe = new Set<string>();

  public readonly pathFinder: ColonyPathFinder;

  public constructor(id: string, room: Room, pathFinder: ColonyPathFinder) {
    super(id, room);
    this.pathFinder = pathFinder;
  }

  public plan(): void {
    // TODO: do automatic placement
    const spawn = this.room.find(FIND_STRUCTURES, {
      filter: { structureType: STRUCTURE_SPAWN },
    })[0];

    if (!spawn) {
      return;
    }

    this.costMatrix = new PathFinder.CostMatrix();

    this.loadFromPrefab(BunkerPrefab as Prefab, spawn.pos);
    this.addPaths(spawn.pos);
  }

  public static getColonyPlan(room: Room, colonyPathFinder: ColonyPathFinder): ColonyPlan {
    return new ColonyPlan(getIdFromRoom(room, COLONY_PLAN_ID), room, colonyPathFinder);
  }

  private loadFromPrefab(prefab: Prefab, center: RoomPosition) {
    prefab[1].forEach((rclPrefab, index) => {
      let rclPrefabForRoom: Array<BuildingPlan>;

      if (this.rclPrefabs.length > index) {
        rclPrefabForRoom = this.rclPrefabs[index];
      } else {
        rclPrefabForRoom = [];
        this.rclPrefabs.push(rclPrefabForRoom);
      }

      rclPrefab.forEach((buildingPrefab) => {
        const buildingPlan: BuildingPlan = [buildingPrefab[0], []];
        buildingPrefab[1].forEach((buildingPos) => {
          if (buildingPos[1][0] === 0 && buildingPos[1][1] === 0) {
            return;
          }
          this.addBuildingPos(buildingPlan, [
            buildingPos[1][0] + center.x, buildingPos[1][1] + center.y,
          ]);
        });
        rclPrefabForRoom.push(buildingPlan);
      });
    });

    prefab[2].forEach((rawRoad) => {
      rawRoad.forEach((roadPos) => {
        roadPos[0] += center.x;
        roadPos[1] += center.y;
      });
      this.pathFinder.addRoad(rawRoad)
    });
  }

  private addPaths(origin: RoomPosition) {
    const roadBuildingPlan = this.rclPrefabs[0]
      .find(buildingPrefab => buildingPrefab[0] === BuildingTypeToPrefabTypeMap[STRUCTURE_ROAD]);
    let containerBuildingPrefab = this.rclPrefabs[0]
      .find(buildingPrefab => buildingPrefab[0] === BuildingTypeToPrefabTypeMap[STRUCTURE_CONTAINER]);

    if (!containerBuildingPrefab) {
      containerBuildingPrefab = [BuildingTypeToPrefabTypeMap[STRUCTURE_CONTAINER], []];
      this.rclPrefabs[0].push(containerBuildingPrefab);
    }

    this.room.find(FIND_SOURCES).forEach((source) => {
      this.addPathToTarget(roadBuildingPlan, containerBuildingPrefab, origin, source.pos, 1);
    });
    this.addPathToTarget(roadBuildingPlan, containerBuildingPrefab, origin, this.room.controller.pos, 3);
  }

  private addPathToTarget(
    roadBuildingPlan: BuildingPlan, containerBuildingPlan: BuildingPlan,
    origin: RoomPosition, target: RoomPosition, range: number,
  ) {
    const pathFinderPath = PathFinder.search(origin, {pos: target, range}, {
      roomCallback: () => {
        return this.costMatrix;
      }
    });
    const rawRoad = new Array<ArrayPos>();

    pathFinderPath.path.forEach((pos, index) => {
      const arrayPos: ArrayPos = [pos.x, pos.y];
      if (index < pathFinderPath.path.length - 1) rawRoad.push(arrayPos);
      this.addBuildingPos(roadBuildingPlan, arrayPos);
    });
    this.addBuildingPos(containerBuildingPlan, [
      pathFinderPath.path[pathFinderPath.path.length - 1].x,
      pathFinderPath.path[pathFinderPath.path.length - 1].y,
    ]);

    this.pathFinder.addRoad(rawRoad);
  }

  private addBuildingPos(
    buildingPlan: BuildingPlan, buildingPos: ArrayPos,
  ) {
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
}
