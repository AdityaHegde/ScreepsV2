import {EntityWrapper} from "./EntityWrapper";
import {ArrayPos} from "../preprocessing/Prefab";
import {inMemory} from "@memory/inMemory";
import {JobParams} from "../entity-group/group/job/JobParams";

export class CreepWrapper extends EntityWrapper<Creep> {
  @inMemory()
  public power: number;

  @inMemory()
  public path: Array<DirectionConstant>;
  @inMemory()
  public lastPos: ArrayPos;
  public currentMoveDirection: DirectionConstant;
  @inMemory()
  public job: JobParams;

  public hasReachedDest(): boolean {
    return this.path && this.path.length === 0;
  }
  public failedToMove(): boolean {
    return this.lastPos[0] === this.entity.pos.x && this.lastPos[1] === this.entity.pos.y;
  }
  public clearMovement(): void {
    this.lastPos = undefined;
    this.currentMoveDirection = undefined;
    this.path = undefined;
  }
}
