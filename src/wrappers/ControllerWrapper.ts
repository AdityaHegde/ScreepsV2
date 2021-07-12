import {EntityWrapper} from "./EntityWrapper";
import {PositionsEntity} from "@utils/rearrangePositions";
import {inMemory} from "@memory/inMemory";
import {ArrayPos} from "../preprocessing/Prefab";
import {initPositionsEntry} from "@utils/initPositionsEntry";
import {RoadPos} from "@pathfinder/RoadTypes";

export class ControllerWrapper extends EntityWrapper<StructureController> implements PositionsEntity {
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
