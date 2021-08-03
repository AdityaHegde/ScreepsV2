import {PositionsEntityWrapper} from "@wrappers/positions/PositionsEntityWrapper";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {Globals} from "@globals/Globals";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {SOURCE_ID} from "../../constants";
import {WeightedGroup} from "@wrappers/group/WeightedGroup";

export type HarvestableEntityType = (Source | Mineral);

export class HarvestableEntityWrapper<HarvestableEntityTypeSelect extends HarvestableEntityType>
  extends PositionsEntityWrapper<HarvestableEntityTypeSelect> {

  public readonly harvestPower: number;
  public readonly resourceType: ResourceConstant;
  public readonly cooldown: number;
  public readonly regenTime: number;
  public readonly capacity: number;

  public jobSource(creepWrapper: CreepWrapper): number {
    let returnValue: number;
    if (this.container) {
      returnValue = creepWrapper.entity.withdraw(this.container.entity, this.resourceType);
    } else {
      const foundResource = creepWrapper.entity.room.lookForAt(
        LOOK_RESOURCES, this.positions[this.middleIdx][0], this.positions[this.middleIdx][1],
      ).find(resource => resource.resourceType === this.resourceType);
      if (foundResource) {
        returnValue = creepWrapper.entity.pickup(foundResource);
      }
    }

    if (returnValue === OK) {
      creepWrapper.targetWeight = 0;
      creepWrapper.weight = 0;
    }

    return returnValue;
  }

  protected takeAction(creepWrapper: CreepWrapper): void {
    this.logger.log(`id=${this.id} status=${creepWrapper.entity.harvest(this.entity)} ` +
      `resource=${creepWrapper.entity.store[this.resourceType]} pos=(${creepWrapper.arrayPos.toString()})`);
  }

  protected middleCreepAction(creepWrapper: CreepWrapper, totalPower: number): void {
    const capacity = creepWrapper.entity.store.getCapacity(this.resourceType);
    const freeCapacity = creepWrapper.entity.store.getFreeCapacity(this.resourceType);
    const usedCapacity = creepWrapper.entity.store.getUsedCapacity(this.resourceType);

    if (this.container && usedCapacity <= totalPower * HARVEST_POWER) {
      creepWrapper.entity.transfer(this.container.entity, this.resourceType);
      Globals.getGlobal<WeightedGroup>(WeightedGroup as any, getIdFromRoom(this.entity.room, SOURCE_ID))
        .updateCurrentWeight(this, capacity, this.container.entity.store.getCapacity(this.resourceType));
    } else if (freeCapacity === 0) {
      creepWrapper.entity.drop(this.resourceType);
      this.hasHaul = false;
    } else if (!this.hasHaul && freeCapacity <= totalPower * this.harvestPower * 10) {
      Globals.getGlobal<WeightedGroup>(WeightedGroup as any, getIdFromRoom(this.entity.room, SOURCE_ID))
        .updateCurrentWeight(this, creepWrapper.entity.store.getCapacity(), creepWrapper.entity.store.getCapacity());
      this.hasHaul = true;
    }
  }

  protected sideCreepActionToContainer(creepWrapper: CreepWrapper): void {
    creepWrapper.entity.transfer(this.container.entity, this.resourceType);
  }

  protected sideCreepActionToAnother(creepWrapper: CreepWrapper, targetCreepWrapper: CreepWrapper): void {
    creepWrapper.entity.transfer(targetCreepWrapper.entity, this.resourceType);
  }
}
