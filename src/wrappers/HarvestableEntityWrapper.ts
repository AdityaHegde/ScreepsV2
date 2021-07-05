import {EntityWrapper} from "./EntityWrapper";
import {ArrayPos, RoadPos} from "../preprocessing/Prefab";
import {inMemory} from "@memory/inMemory";
import {PositionsEntity} from "@utils/rearrangePositions";
import {initPositionsEntry} from "@utils/initPositionsEntry";

export type HarvestableEntityType = (Source | Mineral);

Object.defineProperty(Source.prototype, "harvestPower", {
  value: HARVEST_POWER,
});
Object.defineProperty(Source.prototype, "resourceType", {
  value: RESOURCE_ENERGY,
});
Object.defineProperty(Source.prototype, "cooldown", {
  value: 1,
});
Object.defineProperty(Source.prototype, "regenTime", {
  value: ENERGY_REGEN_TIME,
});
Object.defineProperty(Source.prototype, "capacity", {
  get(this: Source) {
    return this.energyCapacity;
  }
});

Object.defineProperty(Mineral.prototype, "harvestPower", {
  value: HARVEST_MINERAL_POWER,
});
Object.defineProperty(Mineral.prototype, "resourceType", {
  get(this: Mineral): ResourceConstant {
    return this.mineralType;
  }
});
Object.defineProperty(Mineral.prototype, "cooldown", {
  value: EXTRACTOR_COOLDOWN,
});
Object.defineProperty(Mineral.prototype, "regenTime", {
  value: MINERAL_REGEN_TIME,
});
Object.defineProperty(Mineral.prototype, "capacity", {
  get(this: Mineral) {
    return this.density;
  }
});

declare global {
  interface Source {
    harvestPower: number;
    resourceType: ResourceConstant;
    cooldown: number;
    regenTime: number;
    capacity: number;
  }
  interface Mineral {
    harvestPower: number;
    resourceType: ResourceConstant;
    cooldown: number;
    regenTime: number;
    capacity: number;
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
