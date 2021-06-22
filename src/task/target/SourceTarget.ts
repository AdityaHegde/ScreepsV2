import {Target} from "./Target";
import {DepositTargetType} from "./DepositTarget";

export class SourceTarget extends Target<Source> {
  public getWeightForCreep(creep:Creep): number {
    return creep.store.getFreeCapacity(RESOURCE_ENERGY);
  }

  public getWeightForTarget(target: Source): number {
    let capacity = 0;
    const roomTerrain = Game.map.getRoomTerrain(target.room.name);
    for (let x = target.pos.x - 1; x <= target.pos.x + 1; x++) {
      for (let y = target.pos.y - 1; y <= target.pos.y + 1; y++) {
        if (roomTerrain.get(x, y) !== TERRAIN_MASK_WALL) {
          capacity++;
        }
      }
    }
    return capacity;
  }

  public takeAction(creep: Creep, target: Source): number {
    return creep.harvest(target);
  }

  public getWeightPerAction(creep: Creep): number {
    return creep.memory.power * HARVEST_POWER;
  }

  public updateWeights(creep: Creep, currentWeight: number): number {
    creep.memory.weight = this.getWeightForCreep(creep);
    return currentWeight - 1;
  }

  public releasedWeightUpdate(target: Source, currentWeight: number): number {
    return currentWeight + 1;
  }

  public getInitialTargets(room: Room): Array<Source> {
    return room.find(FIND_SOURCES);
  }
}
