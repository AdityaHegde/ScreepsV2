import {ContainerActionGroup} from "./ContainerActionGroup";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {ControllerWrapper} from "@wrappers/ControllerWrapper";

export class ControllerUpgradeGroup extends ContainerActionGroup<ControllerWrapper> {
  protected takeAction(creepWrapper: CreepWrapper): void {
    this.logger.log(`status=${creepWrapper.entity.upgradeController(this.target.entity)} ` +
      `resource=${creepWrapper.entity.store[RESOURCE_ENERGY]}`);
  }

  protected middleCreepAction(creepWrapper: CreepWrapper): void {
    if (creepWrapper.entity.store[RESOURCE_ENERGY] <= creepWrapper.power * UPGRADE_CONTROLLER_POWER) {
      creepWrapper.entity.withdraw(this.container.entity, RESOURCE_ENERGY);
    }
  }
}
