import {ContainerActionGroup} from "./ContainerActionGroup";
import {CreepWrapper} from "@wrappers/CreepWrapper";

export class ControllerUpgradeGroup extends ContainerActionGroup {
  protected takeAction(creepWrapper: CreepWrapper): void {
    creepWrapper.entity.upgradeController(this.target.entity);
  }

  protected middleCreepAction(creepWrapper: CreepWrapper): void {
    if (creepWrapper.entity.store[RESOURCE_ENERGY] <= creepWrapper.power * UPGRADE_CONTROLLER_POWER) {
      creepWrapper.entity.withdraw(this.container.entity, RESOURCE_ENERGY);
    }
  }
}
