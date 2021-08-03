import {PositionsEntityWrapper} from "@wrappers/positions/PositionsEntityWrapper";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {Globals} from "@globals/Globals";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {DEPOSIT_ID} from "../../constants";
import {WeightedGroup} from "@wrappers/group/WeightedGroup";
import {getWrapperById} from "@wrappers/getWrapperById";

export class ControllerWrapper extends PositionsEntityWrapper<StructureController> {
  public jobTarget(creepWrapper: CreepWrapper): number {
    let returnValue: number;
    if (this.container) {
      returnValue = creepWrapper.entity.transfer(this.container.entity, RESOURCE_ENERGY);
    } else if (this.positionAssignments[this.middleIdx]) {
      const middleCreep = getWrapperById(this.positionAssignments[this.middleIdx]) as CreepWrapper;
      if (middleCreep) {
        returnValue = creepWrapper.entity.transfer(middleCreep.entity, RESOURCE_ENERGY);
      }
    }

    if (returnValue === OK) {
      creepWrapper.targetWeight = 0;
      creepWrapper.weight = 0;
    }

    return returnValue;
  }

  protected takeAction(creepWrapper: CreepWrapper): void {
    this.logger.log(`id=${this.id} status=${creepWrapper.entity.upgradeController(this.entity)} ` +
      `resource=${creepWrapper.entity.store[RESOURCE_ENERGY]} pos=(${creepWrapper.arrayPos.toString()})`);
  }

  protected middleCreepAction(creepWrapper: CreepWrapper, totalPower: number): void {
    const energy = creepWrapper.entity.store[RESOURCE_ENERGY];
    const capacity = creepWrapper.entity.store.getCapacity(RESOURCE_ENERGY);

    if (this.container && energy <= totalPower * UPGRADE_CONTROLLER_POWER) {
      creepWrapper.entity.withdraw(this.container.entity, RESOURCE_ENERGY);
      Globals.getGlobal<WeightedGroup>(WeightedGroup as any, getIdFromRoom(this.entity.room, DEPOSIT_ID))
        .updateCurrentWeight(this, -capacity, this.container.entity.store.getUsedCapacity(RESOURCE_ENERGY));
    } else if (energy <= totalPower * UPGRADE_CONTROLLER_POWER * 5) {
      if (!this.hasHaul) {
        Globals.getGlobal<WeightedGroup>(WeightedGroup as any, getIdFromRoom(this.entity.room, DEPOSIT_ID))
          .updateCurrentWeight(this, creepWrapper.entity.store.getCapacity(), creepWrapper.entity.store.getCapacity());
        console.log("Adding haul job");
        this.hasHaul = true;
      }
    } else {
      console.log("Haul job resolved");
      this.hasHaul = false;
    }
  }

  protected sideCreepActionToAnother(creepWrapper: CreepWrapper, targetCreepWrapper: CreepWrapper, powerLeft: number): void {
    targetCreepWrapper.entity.transfer(creepWrapper.entity, RESOURCE_ENERGY, powerLeft);
  }
}

(StructureController.prototype as any).WRAPPER = ControllerWrapper;
