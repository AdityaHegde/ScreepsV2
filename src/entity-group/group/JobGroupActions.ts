import {CreepWrapper} from "@wrappers/CreepWrapper";
import {BaseEntityType, EntityWrapper} from "@wrappers/EntityWrapper";
import {JobResourceTypeIdx} from "./JobNetwork";

export class JobGroupActions {
  public readonly sourceWeightMultiplier: number;
  public readonly targetWeightMultiplier: number;

  public constructor(sourceWeightMultiplier: number, targetWeightMultiplier: number) {
    this.sourceWeightMultiplier = sourceWeightMultiplier;
    this.targetWeightMultiplier = targetWeightMultiplier;
  }

  public sourceAction(creepWrapper: CreepWrapper, sourceWrapper: EntityWrapper<BaseEntityType>): number {
    if (sourceWrapper.entity instanceof Resource) {
      return creepWrapper.entity.pickup(sourceWrapper.entity);
    } else if (sourceWrapper.entity instanceof Creep) {
      return sourceWrapper.entity.transfer(creepWrapper.entity, creepWrapper.job[JobResourceTypeIdx]);
    }
    return -1;
  }

  public targetAction(creepWrapper: CreepWrapper, targetWrapper: EntityWrapper<BaseEntityType>): number {
    return OK;
  }
}
