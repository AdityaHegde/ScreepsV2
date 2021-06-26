import {MemoryClass} from "@memory/MemoryClass";
import {RoomBaseClass} from "../RoomBaseClass";
import {inMemory} from "@memory/inMemory";
import {ArrayPos, BuildingPrefab, Prefab, RCLPrefab} from "../preprocessing/Prefab";
import {BunkerPrefab} from "../data/Bunker";
import {
  BuildingPrefabTypeToTypeMap,
  BuildingTypeToPrefabTypeMap,
  WALKABLE_BUILDING_TYPES
} from "../preprocessing/ParserMetadata";
import {getIdFromRoom} from "../utils/getIdFromRoom";
import {COLONY_PLAN_ID} from "../constants";

@MemoryClass("plan")
export class ColonyPlan extends RoomBaseClass {
  @inMemory(() => [])
  public rclPrefabs: Array<RCLPrefab>;

  public costMatrix: CostMatrix;

  public positionDedupe = new Set<string>();

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

  public static getColonyPlan(room: Room): ColonyPlan {
    return new ColonyPlan(getIdFromRoom(room, COLONY_PLAN_ID), room);
  }

  private loadFromPrefab(prefab: Prefab, center: RoomPosition) {
    prefab[1].forEach((rclPrefab, index) => {
      let rclPrefabForRoom: RCLPrefab;

      if (this.rclPrefabs.length > index) {
        rclPrefabForRoom = this.rclPrefabs[index];
      } else {
        rclPrefabForRoom = [];
        this.rclPrefabs.push(rclPrefabForRoom);
      }

      rclPrefab.forEach((buildingPrefab) => {
        const buildingPrefabForRoom: BuildingPrefab = [buildingPrefab[0], []];
        buildingPrefab[1].forEach((buildingPos) => {
          if (buildingPos[0] === 0 && buildingPos[1] === 0) {
            return;
          }
          this.addBuildingPos(buildingPrefabForRoom, [
            buildingPos[0] + center.x, buildingPos[1] + center.y,
          ]);
        });
        rclPrefabForRoom.push(buildingPrefabForRoom);
      });
    });
  }

  private addPaths(origin: RoomPosition) {
    const roadBuildingPrefab = this.rclPrefabs[0]
      .find(buildingPrefab => buildingPrefab[0] === BuildingTypeToPrefabTypeMap[STRUCTURE_ROAD]);
    let containerBuildingPrefab = this.rclPrefabs[0]
      .find(buildingPrefab => buildingPrefab[0] === BuildingTypeToPrefabTypeMap[STRUCTURE_CONTAINER]);

    if (!containerBuildingPrefab) {
      containerBuildingPrefab = [BuildingTypeToPrefabTypeMap[STRUCTURE_CONTAINER], []];
      this.rclPrefabs[0].push(containerBuildingPrefab);
    }

    this.room.find(FIND_SOURCES).forEach((source) => {
      this.addPathToTarget(roadBuildingPrefab, containerBuildingPrefab, origin, source.pos, 1);
    });
    this.addPathToTarget(roadBuildingPrefab, containerBuildingPrefab, origin, this.room.controller.pos, 3);
  }

  private addPathToTarget(
    roadBuildingPrefab: BuildingPrefab, containerBuildingPrefab: BuildingPrefab,
    origin: RoomPosition, target: RoomPosition, range: number,
  ) {
    const pathFinderPath = PathFinder.search(origin, {pos: target, range}, {
      roomCallback: () => {
        return this.costMatrix;
      }
    });
    pathFinderPath.path.forEach((pos) => {
      this.addBuildingPos(roadBuildingPrefab, [pos.x, pos.y]);
    });
    this.addBuildingPos(containerBuildingPrefab, [
      pathFinderPath.path[pathFinderPath.path.length - 1].x,
      pathFinderPath.path[pathFinderPath.path.length - 1].y,
    ]);
  }

  private addBuildingPos(
    buildingPrefabForRoom: BuildingPrefab, buildingPos: ArrayPos,
  ) {
    const posForRoom: ArrayPos = [...buildingPos];

    const dedupeKey = `${buildingPrefabForRoom[0]}-${posForRoom[0]}-${posForRoom[1]}`;
    if (this.positionDedupe.has(dedupeKey)) {
      return;
    }
    this.positionDedupe.add(dedupeKey);

    buildingPrefabForRoom[1].push(posForRoom);
    if (!(BuildingPrefabTypeToTypeMap[buildingPrefabForRoom[0]] in WALKABLE_BUILDING_TYPES)) {
      this.costMatrix.set(posForRoom[0], posForRoom[1], 255);
    }
  }
}
