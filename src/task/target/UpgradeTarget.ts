import {Target} from "./Target";

export class UpgradeTarget extends Target<StructureController> {
  public getWeightForCreep(creep: Creep): number {
    return creep.store.getUsedCapacity(RESOURCE_ENERGY);
  }

  public getWeightForTarget(): number {
    return 25;
  }

  public takeAction(creep: Creep, target: StructureController): number {
    return creep.upgradeController(target);
  }

  public getWeightPerAction(creep: Creep): number {
    return creep.memory.power * UPGRADE_CONTROLLER_POWER;
  }

  public updateWeights(creep: Creep, currentWeight: number): number {
    creep.memory.weight = this.getWeightForCreep(creep);
    return currentWeight - 1;
  }

  public releasedWeightUpdate(target: StructureController, currentWeight: number): number {
    return currentWeight + 1;
  }

  public getInitialTargets(room: Room): Array<StructureController> {
    return [room.controller];
  }
}
