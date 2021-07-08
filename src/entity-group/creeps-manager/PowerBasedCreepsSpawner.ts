import {CreepsSpawner} from "./CreepsSpawner";
import {CreepSpawnQueueEntry} from "./CreepSpawnQueue";

export class PowerBasedCreepsSpawner extends CreepsSpawner {
  public currentPower: number;

  public shouldSpawnCreeps(): boolean {
    if (!super.shouldSpawnCreeps()) return false;

    this.currentPower = this.creepGroup.entityWrappers.reduce(
      (totalPower, creepWrapper) => totalPower + creepWrapper.power, 0);
    const currentBodyPartCount = this.getBodyParts(Math.min(this.mainPartsCount, this.maxMainPartsCount - this.currentPower)).length;

    for (const creepWrapper of this.creepGroup.entityWrappers) {
      // TODO: add move time
      if (creepWrapper.entity.ticksToLive < (currentBodyPartCount * CREEP_SPAWN_TIME)) {
        this.currentPower -= creepWrapper.power;
      } else {
        break;
      }
    }

    return this.maxMainPartsCount - this.currentPower > 0;
  }

  public getSpawnQueueEntry(): CreepSpawnQueueEntry {
    const partsCountDiff = this.maxMainPartsCount - this.currentPower;
    if (partsCountDiff <= 0) return null;

    this.queuedCreepNumber++;
    return [this.id, this.getBodyPartsCost(this.getBodyParts()), Math.min(this.mainPartsCount, partsCountDiff)];
  }
}
