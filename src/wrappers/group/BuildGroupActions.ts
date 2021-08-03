import {JobGroupActions} from "@wrappers/group/JobGroupActions";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {BaseEntityType, GameEntity} from "@wrappers/GameEntity";
import {EventLoop} from "../../events/EventLoop";
import {StructureBuiltEventHandler} from "../../events/StructureBuiltEventHandler";

export class BuildGroupActions extends JobGroupActions {
  public readonly range: number = 3;

  public targetAction(creepWrapper: CreepWrapper, targetWrapper: GameEntity<BaseEntityType>): number {
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
      const weightDecrease = Math.min(powerMulti * creepWrapper.power, creepWrapper.entity.store.getUsedCapacity());
      creepWrapper.targetWeight -= weightDecrease;
      creepWrapper.weight -= weightDecrease;
    }
    return returnValue;
  }

  public targetCompleted(creepWrapper: CreepWrapper, targetWrapper: GameEntity<BaseEntityType>): void {
    if (targetWrapper.entity instanceof ConstructionSite) {
      EventLoop.getEventLoop().addEvent(StructureBuiltEventHandler.getEvent(
        creepWrapper.entity.room.name, targetWrapper.entity.structureType, targetWrapper.entity.pos.x, targetWrapper.entity.pos.y));
    }
  }
}
