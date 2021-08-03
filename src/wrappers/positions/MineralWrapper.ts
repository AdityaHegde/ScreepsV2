import {alias} from "@memory/alias";
import {HarvestableEntityWrapper} from "@wrappers/positions/HarvestableEntityWrapper";

export class MineralWrapper extends HarvestableEntityWrapper<Source> {
  public readonly harvestPower = HARVEST_MINERAL_POWER;
  @alias("entity.mineralType")
  public readonly resourceType: ResourceConstant;
  public readonly cooldown = EXTRACTOR_COOLDOWN;
  public readonly regenTime = MINERAL_REGEN_TIME;
  @alias("entity.density")
  public readonly capacity: number;
}

(Mineral.prototype as any).WRAPPER = MineralWrapper;
