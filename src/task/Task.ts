import {BaseClass} from "src/BaseClass";
import {BaseTargetType, Target} from "./target/Target";
import {TargetPool} from "./target-pool/TargetPool";
import {Logger} from "../utils/Logger";
import {TASK_DONE} from "../constants";
import {MemoryClass} from "@memory/MemoryClass";

@MemoryClass("task")
export class Task<TargetType extends BaseTargetType, TargetClass extends Target<TargetType>>
  extends BaseClass {

  protected logger = new Logger("Task");

  public readonly target: TargetClass;
  public readonly targetPool: TargetPool<TargetType, TargetClass>;

  public constructor(
    id: string, room: Room,
    target: TargetClass, targetPool: TargetPool<TargetType, TargetClass>,
  ) {
    super(id, room);
    this.target = target;
    this.targetPool = targetPool;
  }

  public init(): void {
    this.targetPool.init();
  }

  public preTick(): void {
    this.targetPool.preTick();
  }

  public tick(creep: Creep): (OK | ERR_INVALID_TARGET | typeof TASK_DONE)  {
    const target = this.acquireTarget(creep);
    if (!target) {
      return ERR_INVALID_TARGET;
    }

    if (!this.moveToTarget(creep, target)) {
      return OK;
    }

    return this.takeAction(creep, target) ? TASK_DONE : OK;
  }

  public postTick(): void {
    this.targetPool.postTick();
  }

  public releaseTarget(creep: Creep): void {
    this.targetPool.releaseTarget(creep);
  }

  protected acquireTarget(creep: Creep): TargetType {
    let target = this.target.getTargetFromId(creep.memory.target);

    if (!target) {
      if (!this.targetPool.claimFreeTarget(creep)) {
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
