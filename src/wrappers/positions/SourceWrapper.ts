import {alias} from "@memory/alias";
import {HarvestableEntityWrapper} from "@wrappers/positions/HarvestableEntityWrapper";

export class SourceWrapper extends HarvestableEntityWrapper<Source> {
  public readonly harvestPower = HARVEST_POWER;
  public readonly resourceType = RESOURCE_ENERGY;
  public readonly cooldown = 1;
  public readonly regenTime = ENERGY_REGEN_TIME;
  @alias("entity.energyCapacity")
  public readonly capacity: number;
}

(Source.prototype as any).WRAPPER = SourceWrapper;
