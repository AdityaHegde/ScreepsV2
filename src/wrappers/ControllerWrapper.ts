import {EntityWrapper} from "./EntityWrapper";
import {PositionsEntity} from "../utils/rearrangePositions";
import {inMemory} from "@memory/inMemory";
import {ArrayPos, RoadPos} from "../preprocessing/Prefab";
import {initPositionsEntry} from "../utils/initPositionsEntry";

export class ControllerWrapper extends EntityWrapper<StructureController> implements PositionsEntity {
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
