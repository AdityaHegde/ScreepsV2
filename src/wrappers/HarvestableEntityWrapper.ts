import {EntityWrapper} from "./EntityWrapper";
import {ArrayPos, RoadPos} from "../preprocessing/Prefab";
import {
  DIRECTION_TO_OFFSET,
  getDirectionBetweenPos,
  ROTATE_ANTI_CLOCKWISE,
  ROTATE_CLOCKWISE,
  rotateDirection
} from "../pathfinder/PathUtils";
import {inMemory} from "@memory/inMemory";
import {PositionsEntity} from "../utils/rearrangePositions";
import {initPositionsEntry} from "../utils/initPositionsEntry";

export type HarvestableEntityType = (Source | Mineral);

Object.defineProperty(Source.prototype, "harvestPower", {
  value: HARVEST_POWER,
});
Object.defineProperty(Source.prototype, "resourceType", {
  value: RESOURCE_ENERGY,
});
Object.defineProperty(Mineral.prototype, "harvestPower", {
  value: HARVEST_MINERAL_POWER,
});
Object.defineProperty(Mineral.prototype, "resourceType", {
  get(this: Mineral): ResourceConstant {
    return this.mineralType;
  }
});
declare global {
  interface Source {
    harvestPower: number;
    resourceType: ResourceConstant;
  }
  interface Mineral {
    harvestPower: number;
    resourceType: ResourceConstant;
  }
}

export class HarvestableEntityWrapper<HarvestableEntityTypeSelect extends HarvestableEntityType>
  extends EntityWrapper<HarvestableEntityTypeSelect> implements PositionsEntity {

  @inMemory()
  public roadPos: RoadPos;

  @inMemory()
  public positions: Array<ArrayPos>;
  @inMemory()
  public positionAssignments: Array<string>;
  @inMemory()
  public middleIdx: number;

  public init(roadPos: RoadPos, roadEndArrayPos: ArrayPos): void {
    this.roadPos = roadPos;
    initPositionsEntry(this, new Room.Terrain(this.entity.room.name), roadEndArrayPos, this.entity.pos);
  }
}
