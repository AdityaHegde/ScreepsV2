import {ArrayPos, BuildingPos, BuildingPrefab, Prefab} from "./Prefab";

export interface Pos {
  x: number;
  y: number;
}

export interface BuildingPrefabJson {
  pos: Array<Pos>;
}

export interface PrefabJson {
  name: string;
  world: string;
  shard: string;
  rcl: number;
  roads: Array<Array<ArrayPos>>;
  buildings: Record<BuildableStructureConstant, BuildingPrefabJson>;
}

export const BuildingPrefabTypeToTypeMap: Array<BuildableStructureConstant> = [
  STRUCTURE_CONTAINER,
  STRUCTURE_EXTENSION,
  STRUCTURE_SPAWN,
  STRUCTURE_LINK,
  STRUCTURE_STORAGE,
  STRUCTURE_TERMINAL,
  STRUCTURE_LAB,
  STRUCTURE_TOWER,
  STRUCTURE_OBSERVER,
  STRUCTURE_POWER_SPAWN,
  STRUCTURE_FACTORY,
  STRUCTURE_NUKER,
  STRUCTURE_ROAD,
  STRUCTURE_WALL,
  STRUCTURE_RAMPART,
];
export const BuildingTypeToPrefabTypeMap: Record<BuildableStructureConstant, any> =
  BuildingPrefabTypeToTypeMap.reduce((map, structureConstant, prefabType) => {
    map[structureConstant] = prefabType;
    return map;
  }, {}) as any;
export const WALKABLE_BUILDING_TYPES = {
  [STRUCTURE_ROAD]: 1,
  [STRUCTURE_RAMPART]: 1,
  [STRUCTURE_CONTAINER]: 1,
}

export class ParserMetadata {
  public readonly prefab: Prefab = [[], [], []];
  private readonly buildingPosMap = new Map<string, BuildingPos>();
  private minX = Number.MAX_SAFE_INTEGER;
  private maxX = Number.MIN_SAFE_INTEGER;
  private minY = Number.MAX_SAFE_INTEGER;
  private maxY = Number.MIN_SAFE_INTEGER;
  private xSum = 0;
  private ySum = 0;

  private spawnPos: ArrayPos;

  public addRcl(rclIdx: number): void {
    if (this.prefab[1].length > rclIdx) {
      return;
    }

    this.prefab[1].push([]);
  }

  public addPlanForBuilding(rclIdx: number, buildingPrefabType: number): BuildingPrefab {
    const buildingPrefab: BuildingPrefab = [buildingPrefabType, []];
    this.prefab[1][rclIdx].push(buildingPrefab);
    return buildingPrefab;
  }

  public addPosToBuilding(buildingPrefab: BuildingPrefab, pos: Pos): void {
    const buildingPos: BuildingPos = [[], [pos.x, pos.y]];
    if (BuildingPrefabTypeToTypeMap[buildingPrefab[0]] === STRUCTURE_SPAWN && !this.spawnPos) {
      this.spawnPos = [pos.x, pos.y];
    }

    buildingPrefab[1].push(buildingPos);

    if (pos.x > this.maxX) {
      this.maxX = pos.x;
    }
    if (pos.x < this.minX) {
      this.minX = pos.x;
    }
    if (pos.y > this.maxY) {
      this.maxY = pos.y;
    }
    if (pos.y < this.minY) {
      this.minY = pos.y;
    }

    this.xSum += pos.x;
    this.ySum += pos.y;
  }

  public normalize(): void {
    const centroid: ArrayPos = this.spawnPos ? [...this.spawnPos] : [
      Math.round(this.xSum / this.buildingPosMap.size), Math.round(this.ySum / this.buildingPosMap.size),
    ];

    this.maxX -= centroid[0];
    this.minX -= centroid[0];
    this.maxY -= centroid[1];
    this.minY -= centroid[1];

    this.prefab[1].forEach(rclPrefab => rclPrefab
      .forEach(buildingPrefab => buildingPrefab[1].forEach(buildingPos => {
        buildingPos[1][0] -= centroid[0]; buildingPos[1][1] -= centroid[1];
        this.buildingPosMap.set(`${buildingPos[1][0]}-${buildingPos[1][1]}`, buildingPos);
      })));

    this.prefab[0] = [
      this.minY, this.maxX, this.maxY, this.minX,
    ];

    this.processRoads(centroid);
  }

  private processRoads(centroid: ArrayPos): void {
    this.prefab[2].forEach((road, roadIdx) => {
      road.forEach((roadPos, roadPosIdx) => {
        roadPos[0] -= centroid[0];
        roadPos[1] -= centroid[1];
        this.assignRoadPos(roadPos, roadIdx, roadPosIdx);
      });
    });
    this.prefab[2].forEach((road, roadIdx) => {
      road.forEach((roadPos, roadPosIdx) => {
        // road structure should only have itself as pos
        this.buildingPosMap.get(`${roadPos[0]}-${roadPos[1]}`)[0] = [[roadIdx, roadPosIdx]];
      });
    });
  }

  private assignRoadPos(roadPos: ArrayPos, roadIdx: number, roadPosIdx: number) {
    for (let x = roadPos[0] - 1; x <= roadPos[0] + 1; x++) {
      for (let y = roadPos[1] - 1; y <= roadPos[1] + 1; y++) {
        const buildingPrefab = this.buildingPosMap.get(`${x}-${y}`);
        if (buildingPrefab) {
          buildingPrefab[0].push([roadIdx, roadPosIdx]);
        }
      }
    }
  }
}
