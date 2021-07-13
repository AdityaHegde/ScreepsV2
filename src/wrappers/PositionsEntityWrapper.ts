import {EntityWrapper} from "@wrappers/EntityWrapper";
import {inMemory} from "@memory/inMemory";
import {RoadPos} from "@pathfinder/RoadTypes";
import {ArrayPos} from "../preprocessing/Prefab";
import {initPositionsEntry} from "@utils/initPositionsEntry";

export type PositionsEntityType = Source | Mineral | StructureController;

export class PositionsEntityWrapper<PositionsEntityTypeSelect extends PositionsEntityType> extends EntityWrapper<PositionsEntityTypeSelect> {
  @inMemory()
  public roadPos: RoadPos;
  @inMemory()
  public roadEndArrayPos: ArrayPos;

  @inMemory()
  public positions: Array<ArrayPos>;
  @inMemory()
  public positionAssignments: Array<string>;
  @inMemory()
  public middleIdx: number;

  public init(roadPos: RoadPos, adjacentArrayPos: ArrayPos, roadEndArrayPos: ArrayPos): void {
    this.roadPos = roadPos;
    this.roadEndArrayPos = roadEndArrayPos;
    initPositionsEntry(this, new Room.Terrain(this.entity.room.name), adjacentArrayPos, this.entity.pos);
  }
}
