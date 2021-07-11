import {BaseEntityType, EntityWrapper} from "@wrappers/EntityWrapper";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {JobGroupActions} from "./job/JobGroupActions";
import {JobResourceIdx} from "./job/JobParams";

export class HaulGroupActions extends JobGroupActions {
  public targetAction(creepWrapper: CreepWrapper, targetWrapper: EntityWrapper<BaseEntityType>): number {
    return creepWrapper.entity.transfer(targetWrapper.entity as any, creepWrapper.job[JobResourceIdx]);
  }
}
