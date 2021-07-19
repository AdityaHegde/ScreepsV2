import {HarvestableEntityType, HarvestableEntityWrapper} from "@wrappers/HarvestableEntityWrapper";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {ContainerActionGroup} from "./ContainerActionGroup";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {SOURCE_ID} from "../../constants";
import {Globals} from "@globals/Globals";
import {ResourceEntityPool} from "../entity-pool/ResourceEntityPool";
import {EntityPool} from "../entity-pool/EntityPool";

export class HarvestGroup<HarvestableEntityWrapperSelect extends HarvestableEntityWrapper<HarvestableEntityType>>
  extends ContainerActionGroup<HarvestableEntityWrapperSelect> {

  protected takeAction(creepWrapper: CreepWrapper): void {
    this.logger.log(`id=${this.id} status=${creepWrapper.entity.harvest(this.target.entity)} ` +
      `resource=${creepWrapper.entity.store[this.target.entity.resourceType]} pos=(${creepWrapper.arrayPos.toString()})`);
  }

  protected middleCreepAction(creepWrapper: CreepWrapper, totalPower: number): void {
    const resourceType = this.target.entity.resourceType;
    const capacity = creepWrapper.entity.store.getCapacity(resourceType);
    const freeCapacity = creepWrapper.entity.store.getFreeCapacity(resourceType);
    const usedCapacity = creepWrapper.entity.store.getUsedCapacity(resourceType);

    if (this.container && usedCapacity <= totalPower * UPGRADE_CONTROLLER_POWER) {
      creepWrapper.entity.transfer(this.container.entity, resourceType);
      Globals.getGlobal<EntityPool>(EntityPool as any, getIdFromRoom(this.room, SOURCE_ID))
        .addEntityWrapper(this.container, this.container.entity.store.getCapacity(resourceType), capacity);
    } else if (freeCapacity === 0) {
      creepWrapper.entity.drop(this.target.entity.resourceType);
      this.hasHaul = false;
    } else if (!this.hasHaul && freeCapacity <= totalPower * this.target.entity.harvestPower * 10) {
      Globals.getGlobal<ResourceEntityPool>(ResourceEntityPool as any, getIdFromRoom(this.room, SOURCE_ID))
        .addResource(Game.time + 5, creepWrapper.arrayPos[0], creepWrapper.arrayPos[1], resourceType, creepWrapper.entity.store.getCapacity());
      this.hasHaul = true;
    }
  }

  protected sideCreepActionToContainer(creepWrapper: CreepWrapper): void {
    creepWrapper.entity.transfer(this.container.entity, this.target.entity.resourceType);
  }

  protected sideCreepActionToAnother(creepWrapper: CreepWrapper, targetCreepWrapper: CreepWrapper): void {
    creepWrapper.entity.transfer(targetCreepWrapper.entity, this.target.entity.resourceType);
  }
}
