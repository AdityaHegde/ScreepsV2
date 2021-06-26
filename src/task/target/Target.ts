export interface BaseTargetType {
  id: string;
  pos: RoomPosition;
}

export abstract class Target<TargetType extends BaseTargetType> {
  public getTargetFromId(targetId: string): TargetType {
    return Game.getObjectById(targetId);
  }

  public abstract getWeightForCreep(creep: Creep): number;
  public abstract getWeightForTarget(target: TargetType): number;

  public abstract takeAction(creep: Creep, target: TargetType): number;

  public getWeightPerAction(creep: Creep): number {
    return creep.memory.power;
  }

  public updateWeights(creep: Creep, currentWeight: number): number {
    const creepWeight = this.getWeightForCreep(creep);
    if (creepWeight < currentWeight) {
      creep.memory.weight = creepWeight;
      return currentWeight - creepWeight;
    } else {
      creep.memory.weight = currentWeight;
      return 0;
    }
  }

  public releasedWeightUpdate(target: TargetType, currentWeight: number): number {
    return this.getWeightForTarget(target);
  }

  public abstract getInitialTargets(room: Room): Array<TargetType>;

  public targetLowOnWeight(room: Room, target: TargetType): void {
    // nothing to do
  }
}
