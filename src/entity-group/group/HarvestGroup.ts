import {HarvestableEntityType, HarvestableEntityWrapper} from "@wrappers/HarvestableEntityWrapper";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {ContainerActionGroup} from "./ContainerActionGroup";
import {Globals} from "@globals/Globals";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {SOURCE_ID} from "../../constants";
import {EntityPool} from "../entity-pool/EntityPool";

export class HarvestGroup<HarvestableEntityWrapperSelect extends HarvestableEntityWrapper<HarvestableEntityType>>
  extends ContainerActionGroup<HarvestableEntityWrapperSelect> {

  protected takeAction(creepWrapper: CreepWrapper): void {
    this.logger.log(`status=${creepWrapper.entity.harvest(this.target.entity)} ` +
      `resource=${creepWrapper.entity.store[this.target.entity.resourceType]}`);
  }

  protected middleCreepAction(creepWrapper: CreepWrapper): void {
    const totalPower = this.entityWrappers.reduce((power, entityWrapper) =>
      power + entityWrapper.power, 0);
    const resourceType = this.target.entity.resourceType;
    const harvestPower = this.target.entity.harvestPower;

    if (this.container) {
      creepWrapper.entity.transfer(this.container.entity, resourceType);
    } else if (creepWrapper.entity.store[resourceType] ===
               Math.max(CARRY_CAPACITY - totalPower * harvestPower * 10, totalPower * harvestPower)) {
      const sourceEntityPool = Globals.getGlobal<EntityPool>(EntityPool as any, getIdFromRoom(this.room, SOURCE_ID));
      sourceEntityPool.addEntityWrapper(creepWrapper, CARRY_CAPACITY);
      sourceEntityPool.updateCurrentWeight(creepWrapper, CARRY_CAPACITY, CARRY_CAPACITY);
      this.logger.log("Adding haul job");
    }
  }

  protected sideCreepActionToContainer(creepWrapper: CreepWrapper): void {
    creepWrapper.entity.transfer(this.container.entity, this.target.entity.resourceType);
  }

  protected sideCreepActionToAnother(creepWrapper: CreepWrapper, targetCreepWrapper: CreepWrapper): void {
    creepWrapper.entity.transfer(targetCreepWrapper.entity, this.target.entity.resourceType);
  }
}
