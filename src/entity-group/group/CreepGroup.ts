import {EntityGroup} from "./EntityGroup";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {CreepsSpawner} from "../creeps-manager/CreepsSpawner";

export class CreepGroup extends EntityGroup<CreepWrapper> {
  public readonly creepSpawner: CreepsSpawner;
  public readonly pathFinder: ColonyPathFinder;

  public constructor(
    id: string, room: Room,
    creepSpawner: CreepsSpawner, pathFinder: ColonyPathFinder
  ) {
    super(id, room);
    this.creepSpawner = creepSpawner;
    this.pathFinder = pathFinder;
  }

  public init(): void {
    this.creepSpawner.init();
  }
}
