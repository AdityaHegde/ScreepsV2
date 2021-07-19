import {BaseEntityType, EntityWrapper, StoreEntityType} from "@wrappers/EntityWrapper";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {JobGroupActions} from "./job/JobGroupActions";
import {JobResourceIdx} from "./job/JobParams";

export class HaulGroupActions extends JobGroupActions {
  public targetAction(creepWrapper: CreepWrapper, targetWrapper: EntityWrapper<StoreEntityType>): number {
    const returnValue = creepWrapper.entity.transfer(targetWrapper.entity as any, creepWrapper.job[JobResourceIdx]);
    if (returnValue === OK) {
      creepWrapper.targetWeight = 0;
      creepWrapper.weight = 0;
    }
    return returnValue;
  }
}
