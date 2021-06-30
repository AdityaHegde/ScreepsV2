import {BasePosEntityType, EntityWrapper} from "./EntityWrapper";
import {ArrayPos, RoadPos} from "../preprocessing/Prefab";
import {RoadConnectionEntry} from "../pathfinder/Road";
import {inMemory} from "@memory/inMemory";

export class CreepWrapper extends EntityWrapper<Creep> {
  @inMemory()
  public power: number;

  @inMemory()
  public pos: RoadPos;
  @inMemory()
  public dest: RoadPos;
  @inMemory()
  public through: RoadConnectionEntry;
  @inMemory()
  public lastPos: ArrayPos;
  @inMemory()
  public lastRoadPosIdx: number;

  public hasReachedDest(): boolean {
    return this.pos[0] === this.dest[0] && this.pos[1] === this.dest[1];
  }
  public failedToMove(): boolean {
    return this.lastRoadPosIdx >= 0 && this.lastPos[0] === this.entity.pos.x && this.lastPos[1] === this.entity.pos.y;
  }
}
