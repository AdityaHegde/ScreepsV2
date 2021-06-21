import {BaseInstanceClass} from "../../BaseInstanceClass";
import {TargetPoolMemory} from "./TargetPoolMemory";
import {BaseTargetType, Target} from "../target/Target";

export class TargetPoolInstance<
  TargetType extends BaseTargetType, TargetClass extends Target<any>
> extends BaseInstanceClass<TargetPoolMemory> {
  public freeTargets: Array<string>;
  protected target: TargetClass;

  public setTarget(target: TargetClass): this {
    this.target = target;
    return this;
  }

  public preTick(): void {
    this.freeTargets = new Array<string>();
    this.memory.targets.forEach((targetId) => {
      if (this.memory.targetWeight[targetId] > 0) {
        this.freeTargets.push(targetId);
      }
    });
  }

  public postTick(): void {}

  public addTarget(target: TargetType): void {
    const weight = this.target.getWeightForTarget(target);
    this.memory.targets.push(target.id);
    this.memory.targetWeight[target.id] = weight;
  }

  public removeTarget(target: TargetType): void {
    const idx = this.memory.targets.indexOf(target.id);
    if (idx === -1) {
      return;
    }

    this.memory.targets.splice(idx, 1);
    delete this.memory.targetWeight[target.id];
  }

  public updateTargets(): void {
    for (const targetId in this.memory.targetWeight) {
      if (Object.prototype.hasOwnProperty.call(this.memory.targetWeight, targetId)) {
        this.memory.targetWeight[targetId] = this.target.getWeightForTarget(Game.getObjectById(targetId));
      }
    }
  }

  public updateTarget(targetId: string): void {
    if (targetId in this.memory.targetWeight) {
      this.memory.targetWeight[targetId] = this.target.getWeightForTarget(Game.getObjectById(targetId));
    }
  }

  public hasFreeTarget(): boolean {
    return this.freeTargets.length > 0;
  }

  public getFreeTarget(): string {
    return this.freeTargets[0];
  }

  public claimFreeTarget(creep: Creep): boolean {
    if (!this.hasFreeTarget()) {
      return false;
    }

    creep.memory.target = this.getFreeTarget();

    if (!creep.memory.target) {
      delete creep.memory.target;
      return false;
    }

    this.memory.targetWeight[creep.memory.target] =
      this.target.updateWeights(creep, this.memory.targetWeight[creep.memory.target]);

    return true;
  }

  public releaseTarget(creep: Creep): void {
    const target = this.target.getTargetFromId(creep.memory.target);
    if (target) {
      this.memory.targetWeight[creep.memory.target] =
        this.target.releasedWeightUpdate(target, this.memory.targetWeight[creep.memory.target]);
    }
    delete creep.memory.target;
    delete creep.memory.weight;
  }
}
