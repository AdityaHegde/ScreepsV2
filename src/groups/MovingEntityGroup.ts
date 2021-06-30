import {EntityGroup} from "./EntityGroup";
import {CreepWrapper} from "../wrappers/CreepWrapper";
import {EntityWrapper} from "../wrappers/EntityWrapper";
import {ColonyPathFinder} from "../pathfinder/ColonyPathFinder";

export class MovingEntityGroup extends EntityGroup<CreepWrapper> {
  public readonly pathFinder: ColonyPathFinder;

  public readonly EntityWrapperClass = CreepWrapper as typeof EntityWrapper;

  public constructor(id: string, room: Room, pathFinder: ColonyPathFinder) {
    super(id, room);
    this.pathFinder = pathFinder;
  }

  public preTick(): void {
    this.forEachEntityWrapper(creepWrapper => this.pathFinder.resolveMove(creepWrapper.entity));
  }
}
