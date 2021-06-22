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
    creep.memory.weight = Math.max(
      currentWeight - this.getWeightForCreep(creep),
      currentWeight,
    );
    return currentWeight - creep.memory.weight;
  }

  public releasedWeightUpdate(target: TargetType, currentWeight: number): number {
    return this.getWeightForTarget(target);
  }

  public abstract getInitialTargets(room: Room): Array<TargetType>;
}
