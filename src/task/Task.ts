import {ColonyBaseClass} from "src/ColonyBaseClass";
import {BaseTargetType, Target} from "./target/Target";
import {TargetPool} from "./target-pool/TargetPool";
import {Logger} from "../utils/Logger";
import {ACTION_MODE, ERROR_TARGET_MODE, MOVE_MODE, TASK_DONE} from "../constants";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {ColonyPathFinder} from "../pathfinder/ColonyPathFinder";

@MemoryClass("task")
export class Task<TargetType extends BaseTargetType, TargetClass extends Target<TargetType>>
  extends ColonyBaseClass {

  protected logger = new Logger("Task");

  public readonly target: TargetClass;
  public readonly targetPool: TargetPool<TargetType, TargetClass>;
  public readonly pathFinder: ColonyPathFinder;

  /**
   * Count can be delayed by one tick
   */
  @inMemory(() => 0)
  public creepCount: number;

  public constructor(
    id: string, room: Room,
    target: TargetClass, targetPool: TargetPool<TargetType, TargetClass>, pathFinder: ColonyPathFinder,
  ) {
    super(id, room);
    this.target = target;
    this.targetPool = targetPool;
    this.pathFinder = pathFinder;
    this.logger.setRoom(this.room);
  }

  public init(): void {
    this.targetPool.init();
  }

  public preTick(): void {
    this.creepCount = 0;
    this.targetPool.preTick();
  }

  public tick(creep: Creep): (OK | ERR_INVALID_TARGET | typeof TASK_DONE) {
    this.creepCount++;
    const target = this.acquireTarget(creep);
    if (!target) {
      this.logger.log(`mode=${ERROR_TARGET_MODE}`);
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
      if (creep.memory.target) {
        this.targetPool.removeTarget(creep.memory.target);
      }

      if (!this.targetPool.claimFreeTarget(creep)) {
        return null;
      }

      target = this.target.getTargetFromId(creep.memory.target);

      if (!target && creep.memory.target) {
        this.targetPool.removeTarget(creep.memory.target);
      }
    }

    return target;
  }

  protected moveToTarget(creep: Creep, target: TargetType): boolean {
    const range = (target instanceof StructureController) ? 3 : 1;

    if (creep.pos.inRangeTo(target.pos, range)) {
      return true;
    }

    this.logger.log(`mode=${MOVE_MODE} pos=(${creep.pos.x},${creep.pos.y}) toPos=(${target.pos.x},${target.pos.y}) range=${range}`);

    // creep.moveTo(target.pos, {
    //   serializeMemory: true,
    //   range,
    // });
    this.pathFinder.resolveMove(null);
    this.pathFinder.move(null, target.pos);
    return false;
  }

  protected takeAction(creep: Creep, target: TargetType): boolean {
    const result = this.target.takeAction(creep, target);

    if (result === OK) {
      creep.memory.weight -= this.target.getWeightPerAction(creep);
    }

    if (creep.memory.weight <= 0 && this.targetPool.targetWeight[creep.memory.target] <= 0) {
      this.target.targetLowOnWeight(this.room, target);
    }

    this.logger.log(`mode=${ACTION_MODE} target=${target.id} result=${result} weight=${creep.memory.weight}`);

    return creep.memory.weight <= 0;
  }
}
