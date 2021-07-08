import {BaseEntityType, EntityWrapper} from "@wrappers/EntityWrapper";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {JobGroupActions} from "./JobGroupActions";

export class BuildGroupActions extends JobGroupActions {
  public targetAction(creepWrapper: CreepWrapper, targetWrapper: EntityWrapper<BaseEntityType>): number {
    if (targetWrapper.entity instanceof ConstructionSite) {
      return creepWrapper.entity.build(targetWrapper.entity);
    } else if (targetWrapper.entity instanceof Structure) {
      return creepWrapper.entity.repair(targetWrapper.entity);
    }
    return -1;
  }
}
