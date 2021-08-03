import {HarvestableEntityType, HarvestableEntityWrapper} from "@wrappers/positions/HarvestableEntityWrapper";
import {inMemory} from "@memory/inMemory";
import {PowerBasedCreepsSpawner} from "./PowerBasedCreepsSpawner";
import {getWrapperById} from "@wrappers/getWrapperById";

export class HarvesterCreepsSpawner<HarvestableEntityWrapperSelect extends HarvestableEntityWrapper<HarvestableEntityType>> extends PowerBasedCreepsSpawner {
  @inMemory()
  public harvestTargetId: string;
  public harvestTarget: HarvestableEntityWrapperSelect;

  public currentPower: number;

  public init(entity?: HarvestableEntityWrapperSelect): void {
    if (!this.harvestTargetId) {
      console.log(`Missing harvestTargetId in HarvesterCreepsSpawner`);
      return;
    }

    this.lastCapacity = this.room.energyCapacityAvailable;
    this.currentCost = this.getBodyPartsCost(this.getBodyParts());

    this.harvestTarget = getWrapperById(this.harvestTargetId) as HarvestableEntityWrapperSelect;
    this.maxMainPartsCount = this.getMaxMainParts(entity);
  }

  protected getMaxMainParts(entity?: HarvestableEntityWrapperSelect): number {
    return Math.ceil(entity.capacity * entity.cooldown / entity.regenTime / entity.harvestPower);
  }
}
