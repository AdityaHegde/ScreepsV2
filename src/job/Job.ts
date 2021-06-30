import {ColonyBaseClass} from "src/ColonyBaseClass";
import {CreepPool} from "../creep-pool/CreepPool";
import {Task} from "src/task/Task";
import {NEW_TASK_MODE, NO_SUB_TASK_MODE, TASK_DONE} from "../constants";
import {Logger} from "../utils/Logger";
import {MemoryClass} from "@memory/MemoryClass";

@MemoryClass("jobs")
export class Job extends ColonyBaseClass {
  public readonly creepPool: CreepPool;
  public readonly tasks: Array<Array<Task<any, any>>>;

  protected logger = new Logger("Job");

  public constructor(
    id: string, room: Room,
    creepPool: CreepPool, tasks: Array<Array<Task<any, any>>>,
  ) {
    super(id, room);
    this.creepPool = creepPool;
    this.tasks = tasks;
    this.logger.setRoom(this.room);
  }

  public init(): void {
    this.tasks.forEach(tasks => tasks.forEach(task => task.init()));
    this.creepPool.init();
  }

  public preTick(): void {
    this.creepPool.preTick();
    this.tasks.forEach(tasks => tasks.forEach(task => task.preTick()));
  }

  public tick(): void {
    this.creepPool.tick((creep: Creep) => {
      this.logger.setCreep(creep);

      const task = this.tasks[creep.memory.task]?.[creep.memory.subTask];
      if (!task) {
        return;
      }

      const taskStatus = task.tick(creep);

      if (taskStatus === OK) {
        return;
      }

      task.releaseTarget(creep);

      if (taskStatus === ERR_INVALID_TARGET) {
        this.assignSubTask(creep);
      } else if (taskStatus === TASK_DONE) {
        // this.logger.log(`mode=finishedTask`);
        this.assignNextTask(creep);
      }
    }, (creepMemory) => {
      const task = this.tasks[creepMemory.task]?.[creepMemory.subTask];
      if (!task) {
        return;
      }

      task.releaseTarget({
        memory: creepMemory,
      } as Creep);
    });
  }

  public postTick(): void {
    this.creepPool.postTick();
    this.tasks.forEach(tasks => tasks.forEach(task => task.postTick()));
  }

  public assign(creep: Creep): void {
    this.assignNextTask(creep, 0);
  }

  protected assignNextTask(
    creep: Creep, nextTask = (creep.memory.task + 1) % this.tasks.length,
  ): void {
    creep.memory.task = nextTask;
    this.assignSubTask(creep);
  }

  protected assignSubTask(creep: Creep): void {
    let assigned = false;

    creep.memory.subTask = 0;

    for (let i = 0; i < this.tasks[creep.memory.task].length; i++) {
      if (this.tasks[creep.memory.task][i].targetPool.hasFreeTarget()) {
        creep.memory.subTask = i;
        this.logger.log(`mode=${NEW_TASK_MODE}`);
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      this.logger.log(`mode=${NO_SUB_TASK_MODE}`)
    }
  }
}
