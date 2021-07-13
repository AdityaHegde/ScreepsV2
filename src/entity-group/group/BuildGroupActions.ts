import {BaseEntityType, EntityWrapper} from "@wrappers/EntityWrapper";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {JobGroupActions} from "./job/JobGroupActions";
import {EventLoop} from "../../events/EventLoop";
import {StructureBuiltEventHandler} from "../../events/StructureBuiltEventHandler";

export class BuildGroupActions extends JobGroupActions {
  public readonly range: number = 3;

  public targetAction(creepWrapper: CreepWrapper, targetWrapper: EntityWrapper<BaseEntityType>): number {
    let returnValue = -12;
    let powerMulti: number;
    if (targetWrapper.entity instanceof ConstructionSite) {
      returnValue = creepWrapper.entity.build(targetWrapper.entity);
      powerMulti = BUILD_POWER;
    } else if (targetWrapper.entity instanceof Structure) {
      returnValue = creepWrapper.entity.repair(targetWrapper.entity);
      powerMulti = REPAIR_POWER;
    }
    if (returnValue === OK) {
      creepWrapper.targetWeight -= Math.min(powerMulti * creepWrapper.power, creepWrapper.entity.store.getUsedCapacity());
    }
    return returnValue;
  }

  public actionHasCompleted(creepWrapper: CreepWrapper, targetWrapper: EntityWrapper<BaseEntityType>): void {
    if (targetWrapper.entity instanceof ConstructionSite) {
      EventLoop.getEventLoop().addEvent(StructureBuiltEventHandler.getEvent(
        this.room.name, targetWrapper.entity.structureType, targetWrapper.entity.pos.x, targetWrapper.entity.pos.y));
    }
  }
}
