import {CreepPoolStrategy} from "./CreepPoolStrategy";

export class HarvesterPoolStrategy extends CreepPoolStrategy {
  public init(): void {
    const sources = this.room.find(FIND_SOURCES);
    const energyCapacity = sources[0].energyCapacity;

    this.maxPowerPartCount = energyCapacity / ENERGY_REGEN_TIME / HARVEST_POWER;
    this.maxCreeps = sources.length;
  }
}
