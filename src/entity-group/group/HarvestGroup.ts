import {HarvestableEntityType, HarvestableEntityWrapper} from "@wrappers/HarvestableEntityWrapper";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {ContainerActionGroup} from "./ContainerActionGroup";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {SOURCE_ID} from "../../constants";
import {Globals} from "@globals/Globals";
import {ResourceEntityPool} from "../entity-pool/ResourceEntityPool";

export class HarvestGroup<HarvestableEntityWrapperSelect extends HarvestableEntityWrapper<HarvestableEntityType>>
  extends ContainerActionGroup<HarvestableEntityWrapperSelect> {

  protected takeAction(creepWrapper: CreepWrapper): void {
    this.logger.log(`id=${this.id} status=${creepWrapper.entity.harvest(this.target.entity)} ` +
      `resource=${creepWrapper.entity.store[this.target.entity.resourceType]}`);
  }

  protected middleCreepAction(creepWrapper: CreepWrapper): void {
    const resourceType = this.target.entity.resourceType;
    const freeCapacity = creepWrapper.entity.store.getFreeCapacity(resourceType);

    if (this.container) {
      creepWrapper.entity.transfer(this.container.entity, resourceType);
    } else if (freeCapacity === 0) {
      creepWrapper.entity.drop(this.target.entity.resourceType);
      this.hasHaul = false;
    } else if (!this.hasHaul && freeCapacity <= creepWrapper.power * this.target.entity.harvestPower * 10) {
      console.log("Adding haul job");
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
