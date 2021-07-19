import {ContainerActionGroup} from "./ContainerActionGroup";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {ControllerWrapper} from "@wrappers/ControllerWrapper";
import {Globals} from "@globals/Globals";
import {ResourceEntityPool} from "../entity-pool/ResourceEntityPool";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {DEPOSIT_ID} from "../../constants";
import {EntityPool} from "../entity-pool/EntityPool";

export class ControllerUpgradeGroup extends ContainerActionGroup<ControllerWrapper> {
  protected takeAction(creepWrapper: CreepWrapper): void {
    this.logger.log(`id=${this.id} status=${creepWrapper.entity.upgradeController(this.target.entity)} ` +
      `resource=${creepWrapper.entity.store[RESOURCE_ENERGY]} pos=(${creepWrapper.arrayPos.toString()})`);
  }

  protected middleCreepAction(creepWrapper: CreepWrapper, totalPower: number): void {
    const energy = creepWrapper.entity.store[RESOURCE_ENERGY];
    const capacity = creepWrapper.entity.store.getCapacity(RESOURCE_ENERGY);

    if (this.container && energy <= totalPower * UPGRADE_CONTROLLER_POWER) {
      creepWrapper.entity.withdraw(this.container.entity, RESOURCE_ENERGY);
      Globals.getGlobal<EntityPool>(EntityPool as any, getIdFromRoom(this.room, DEPOSIT_ID))
        .addEntityWrapper(this.container, this.container.entity.store.getUsedCapacity(RESOURCE_ENERGY), -capacity);
    } else if (energy <= totalPower * UPGRADE_CONTROLLER_POWER * 5) {
      if (!this.hasHaul) {
        Globals.getGlobal<ResourceEntityPool>(ResourceEntityPool as any, getIdFromRoom(this.room, DEPOSIT_ID))
          .addEntityWrapper(creepWrapper, creepWrapper.entity.store.getCapacity());
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
