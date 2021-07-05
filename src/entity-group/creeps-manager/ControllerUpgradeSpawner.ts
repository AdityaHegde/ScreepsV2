import {PowerBasedCreepsSpawner} from "./PowerBasedCreepsSpawner";

export class ControllerUpgradeSpawner extends PowerBasedCreepsSpawner {
  public init(): void {
    this.lastCapacity = this.room.energyCapacityAvailable;
    this.currentCost = this.getBodyPartsCost(this.getBodyParts());

    this.maxMainPartsCount = this.getMaxMainParts();
  }

  protected getMaxMainParts(): number {
    return 1;
  }
}
