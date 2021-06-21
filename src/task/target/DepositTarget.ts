import {BaseTargetType, Target} from "./Target";

export interface DepositTargetType extends BaseTargetType {
  store: Store<any, any>;
}

export class DepositTarget extends Target<DepositTargetType> {
  protected resource: ResourceConstant;

  public constructor(resource: ResourceConstant) {
    super();
    this.resource = resource;
  }

  public getWeightForCreep(creep: Creep): number {
    return creep.store.getFreeCapacity(this.resource);
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
}
