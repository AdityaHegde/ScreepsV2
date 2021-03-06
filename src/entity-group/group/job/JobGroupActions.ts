import {CreepWrapper} from "@wrappers/CreepWrapper";
import {BaseEntityType, EntityWrapper} from "@wrappers/EntityWrapper";
import {JobResourceIdx} from "./JobParams";
import {Logger} from "@utils/Logger";

export class JobGroupActions {
  public readonly targetWeightMultiplier: number;
  public readonly room: Room;

  public readonly range: number = 1;

  protected logger = new Logger("JobGroupActions");

  public constructor(room: Room, targetWeightMultiplier: number) {
    this.room = room;
    this.targetWeightMultiplier = targetWeightMultiplier;
  }

  public sourceAction(creepWrapper: CreepWrapper, sourceWrapper: EntityWrapper<BaseEntityType>): number {
    if (!sourceWrapper.entity) return -11;
    if (sourceWrapper.entity instanceof Resource) {
      return creepWrapper.entity.pickup(sourceWrapper.entity);
    } else if (sourceWrapper.entity instanceof Creep) {
      return sourceWrapper.entity.transfer(creepWrapper.entity, creepWrapper.job[JobResourceIdx]);
    } else if (sourceWrapper.entity instanceof Structure) {
      return creepWrapper.entity.withdraw(sourceWrapper.entity, creepWrapper.job[JobResourceIdx]);
    }
    return -12;
  }

  public targetAction(creepWrapper: CreepWrapper, targetWrapper: EntityWrapper<BaseEntityType>): number {
    return OK;
  }

  public targetActionCompleted(creepWrapper: CreepWrapper, targetWrapper: EntityWrapper<BaseEntityType>): boolean {
    return creepWrapper.targetWeight <= 0 || creepWrapper.weight <= 0 || !targetWrapper.entity;
  }

  public actionHasCompleted(creepWrapper: CreepWrapper, targetWrapper: EntityWrapper<BaseEntityType>): void {
    // to implement
  }
}
