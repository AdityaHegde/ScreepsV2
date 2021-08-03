import {CreepWrapper} from "@wrappers/CreepWrapper";
import {BaseEntityType, GameEntity} from "@wrappers/GameEntity";

export class JobGroupActions {
  public readonly range: number = 1;

  public targetAction(creepWrapper: CreepWrapper, targetWrapper: GameEntity<BaseEntityType>): number {
    return targetWrapper.jobTarget(creepWrapper);
  }

  public targetCompleted(creepWrapper: CreepWrapper, targetWrapper: GameEntity<BaseEntityType>): void {
    // implement
  }
}
