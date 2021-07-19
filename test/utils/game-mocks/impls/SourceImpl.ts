import {CreepImpl} from "./CreepImpl";

export class SourceImpl implements Source {
  public effects: RoomObjectEffect[];
  public id: Id<this>;
  public pos: RoomPosition;
  public readonly prototype: Source;
  public resourceType = RESOURCE_ENERGY;
  public room: Room;
  public ticksToRegeneration: number;
  public energy = 1500;
  public energyCapacity = 1500;
  public capacity = 1500;
  public cooldown = 1;
  public harvestPower = HARVEST_POWER;
  public regenTime = ENERGY_REGEN_TIME;

  public constructor(
    id: string, pos: RoomPosition,
  ) {
    this.id = id as any;
    this.pos = pos;
  }

  public harvest(creep: CreepImpl): void {
    const energy = Math.min(this.energy, creep.workCount * HARVEST_POWER);
    creep.storeImpl.addEnergy(energy);
    this.energy -= energy;
  }
}
