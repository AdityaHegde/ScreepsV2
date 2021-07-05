import {HarvestableEntityType, HarvestableEntityWrapper} from "@wrappers/HarvestableEntityWrapper";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {ContainerActionGroup} from "./ContainerActionGroup";

export class HarvestGroup<HarvestableEntityWrapperSelect extends HarvestableEntityWrapper<HarvestableEntityType>> extends ContainerActionGroup {
  protected takeAction(creepWrapper: CreepWrapper): void {
    creepWrapper.entity.harvest(this.target.entity);
  }

  protected middleCreepAction(creepWrapper: CreepWrapper): void {
    const resourceType = (this.target as HarvestableEntityWrapperSelect).entity.resourceType;
    if (this.container) {
      creepWrapper.entity.transfer(this.container.entity, resourceType);
    } else {
      creepWrapper.entity.drop(resourceType);
    }
  }

  protected sideCreepActionToContainer(creepWrapper: CreepWrapper): void {
    creepWrapper.entity.transfer(this.container.entity,
      (this.target as HarvestableEntityWrapperSelect).entity.resourceType);
  }

  protected sideCreepActionToAnother(creepWrapper: CreepWrapper, targetCreepWrapper: CreepWrapper): void {
    creepWrapper.entity.transfer(targetCreepWrapper.entity,
      (this.target as HarvestableEntityWrapperSelect).entity.resourceType);
  }
}
