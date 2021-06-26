import {BaseTargetType, Target} from "./Target";

export interface DepositTargetType extends BaseTargetType {
  store: Store<any, any>;
}

export class DepositTarget extends Target<DepositTargetType> {
  protected resource: ResourceConstant;
  protected structureTypes: Set<StructureConstant>;

  public constructor(resource: ResourceConstant, structureTypes: Array<StructureConstant>) {
    super();
    this.resource = resource;
    this.structureTypes = new Set(structureTypes);
  }

  public getWeightForCreep(creep: Creep): number {
    return creep.store.getUsedCapacity(this.resource);
  }

  public getWeightForTarget(target: DepositTargetType): number {
    return target.store.getFreeCapacity(this.resource);
  }

  public takeAction(creep: Creep, target: DepositTargetType): number {
    return creep.transfer(target as any, this.resource);
  }

  public getWeightPerAction(creep: Creep): number {
    return creep.memory.weight;
  }

  public getInitialTargets(room: Room): Array<DepositTargetType> {
    return room.find(FIND_STRUCTURES, {
      filter: structure => this.structureTypes.has(structure.structureType),
    }) as Array<any>;
  }
}
