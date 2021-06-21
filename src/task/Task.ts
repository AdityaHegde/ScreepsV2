import {BaseClass, BaseClassMemory} from "src/BaseClass";
import {BaseTargetType, Target} from "./target/Target";
import {TargetPool} from "./target-pool/TargetPool";
import {TargetPoolInstance} from "./target-pool/TargetPoolInstance";
import {Logger} from "../utils/Logger";
import {TASK_DONE} from "../constants";

export interface TaskMemory extends BaseClassMemory {

}

export interface TaskOpts<TargetClass extends Target<any>> {
  target: TargetClass;
  targetPool: TargetPool<any, any>;
}

@BaseClass.Class("task")
export class Task<TargetType extends BaseTargetType, TargetClass extends Target<TargetType>>
  extends BaseClass<TaskMemory, TaskOpts<TargetClass>> {

  protected logger = new Logger("Task");

  protected readonly target: TargetClass;
  public readonly targetPool: TargetPool<TargetType, TargetClass>;

  public init(room: Room): void {
    this.targetPool.init(room);
  }

  public preTick(room: Room): void {
    this.targetPool.preTick(room);
  }

  public tick(creep: Creep): (OK | ERR_INVALID_TARGET | typeof TASK_DONE)  {
    const targetPoolInstance = this.targetPool.getTargetPoolInstance(creep.room);
    const target = this.acquireTarget(targetPoolInstance, creep);
    if (!target) {
      return ERR_INVALID_TARGET;
    }

    if (!this.moveToTarget(creep, target)) {
      return OK;
    }

    return this.takeAction(creep, target) ? TASK_DONE : OK;
  }

  public postTick(room: Room): void {
    this.targetPool.postTick(room);
  }

  public releaseTarget(creep: Creep): void {
    this.targetPool.getTargetPoolInstance(creep.room).releaseTarget(creep);
  }

  protected acquireTarget(targetPoolInstance: TargetPoolInstance<any, any>, creep: Creep): TargetType {
    let target = this.target.getTargetFromId(creep.memory.target);

    if (!target) {
      if (!targetPoolInstance.claimFreeTarget(creep)) {
        return null;
      }

      target = this.target.getTargetFromId(creep.memory.target);
    }

    return target;
  }

  protected moveToTarget(creep: Creep, target: TargetType): boolean {
    const range = (target instanceof StructureController) ? 3 : 1;

    if (!creep.pos.inRangeTo(target.pos, range)) {
      this.logger.setRoom(creep.room).log(`Moving creep=${creep.name}(${creep.pos.x},${creep.pos.y}) to ` +
        `(${target.pos.x},${target.pos.y}) range=${range}`);

      creep.moveTo(target.pos, {
        serializeMemory: true,
        range,
      });
      return false;
    }

    return true;
  }

  protected takeAction(creep: Creep, target: TargetType): boolean {
    const result = this.target.takeAction(creep, target);

    if (result === OK) {
      creep.memory.weight -= this.target.getWeightPerAction(creep);
    }

    this.logger.setRoom(creep.room).log(`creep=${creep.name} taking action on target=${target.id} ` +
      `result=${result} weight=${creep.memory.weight}`);

    return creep.memory.weight <= 0;
  }
}
