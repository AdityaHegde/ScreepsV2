import {BaseClass} from "../../BaseClass";
import {BaseTargetType, Target} from "../target/Target";
import {inMemory} from "@memory/inMemory";
import {MemoryClass} from "@memory/MemoryClass";

@MemoryClass("targetPool")
export class TargetPool<
  TargetType extends BaseTargetType, TargetClass extends Target<any>,
> extends BaseClass {
  protected readonly target: TargetClass;

  public freeTargets: Array<string>;

  @inMemory(() => [])
  public targets: Array<string>;
  @inMemory(() => { return {} })
  public targetWeight: Record<string, number>;

  public constructor(id: string, room: Room, target: TargetClass) {
    super(id, room);
    this.target = target;
  }

  public init(): void {
    this.target.getInitialTargets(this.room).forEach(target => this.addTarget(target));
  }

  public preTick(): void {
    this.freeTargets = new Array<string>();
    this.targets.forEach((targetId) => {
      if (this.targetWeight[targetId] > 0) {
        this.freeTargets.push(targetId);
      }
    });
  }

  public postTick(): void {}

  public addTarget(target: TargetType): void {
    const weight = this.target.getWeightForTarget(target);
    this.targets.push(target.id);
    this.targetWeight[target.id] = weight;
  }

  public removeTarget(target: TargetType): void {
    const idx = this.targets.indexOf(target.id);
    if (idx === -1) {
      return;
    }

    this.targets.splice(idx, 1);
    delete this.targetWeight[target.id];
  }

  public updateTargets(): void {
    for (const targetId in this.targetWeight) {
      if (Object.prototype.hasOwnProperty.call(this.targetWeight, targetId)) {
        this.targetWeight[targetId] = this.target.getWeightForTarget(Game.getObjectById(targetId));
      }
    }
  }

  public updateTarget(targetId: string): void {
    if (targetId in this.targetWeight) {
      this.targetWeight[targetId] = this.target.getWeightForTarget(Game.getObjectById(targetId));
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

    this.targetWeight[creep.memory.target] =
      this.target.updateWeights(creep, this.targetWeight[creep.memory.target]);

    return true;
  }

  public releaseTarget(creep: Creep): void {
    const target = this.target.getTargetFromId(creep.memory.target);
    if (target) {
      this.targetWeight[creep.memory.target] =
        this.target.releasedWeightUpdate(target, this.targetWeight[creep.memory.target]);
    }
    delete creep.memory.target;
    delete creep.memory.weight;
  }
}
