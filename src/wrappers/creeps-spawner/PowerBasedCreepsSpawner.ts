import {CreepsSpawner} from "./CreepsSpawner";
import {CreepSpawnQueueEntry} from "./CreepSpawnQueue";
import {getWrapperById} from "@wrappers/getWrapperById";
import {CreepWrapper} from "@wrappers/CreepWrapper";

export class PowerBasedCreepsSpawner extends CreepsSpawner {
  public currentPower: number;

  public shouldSpawnCreeps(entityIds: Array<string>, totalPower: number): boolean {
    if (!super.shouldSpawnCreeps(entityIds, totalPower)) return false;

    this.currentPower = totalPower;
    const currentBodyPartCount = this.getBodyParts(Math.min(this.mainPartsCount, this.maxMainPartsCount - this.currentPower)).length;

    for (const entityId of entityIds) {
      const creepWrapper = getWrapperById(entityId) as CreepWrapper;
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
