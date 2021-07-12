import {BaseEntityType, EntityWrapper} from "@wrappers/EntityWrapper";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {JobGroupActions} from "./job/JobGroupActions";
import {EventLoop} from "../../events/EventLoop";
import {StructureBuiltEventHandler} from "../../events/StructureBuiltEventHandler";

export class BuildGroupActions extends JobGroupActions {
  public readonly range: number = 3;

  public targetAction(creepWrapper: CreepWrapper, targetWrapper: EntityWrapper<BaseEntityType>): number {
    if (targetWrapper.entity instanceof ConstructionSite) {
      return creepWrapper.entity.build(targetWrapper.entity);
    } else if (targetWrapper.entity instanceof Structure) {
      return creepWrapper.entity.repair(targetWrapper.entity);
    }
    console.log(JSON.stringify(targetWrapper.entity));
    return -12;
  }

  public targetActionCompleted(creepWrapper: CreepWrapper, targetWrapper: EntityWrapper<BaseEntityType>): boolean {
    return creepWrapper.entity.store[RESOURCE_ENERGY] <= BUILD_POWER * creepWrapper.power ||
      !targetWrapper.entity;
  }

  public actionHasCompleted(creepWrapper: CreepWrapper, targetWrapper: EntityWrapper<BaseEntityType>): void {
    if (targetWrapper.entity instanceof ConstructionSite &&
        targetWrapper.entity.progressTotal - targetWrapper.entity.progress <= creepWrapper.power * BUILD_POWER) {
      EventLoop.getEventLoop().addEvent(StructureBuiltEventHandler.getEvent(
        this.room.name, targetWrapper.entity.structureType, targetWrapper.entity.pos.x, targetWrapper.entity.pos.y));
    }
  }
}
