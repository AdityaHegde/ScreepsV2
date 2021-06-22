import {BaseClass} from "src/BaseClass";
import {CreepPool} from "./CreepPool";
import {Task} from "src/task/Task";
import {TASK_DONE} from "../constants";
import {Logger} from "../utils/Logger";
import {MemoryClass} from "@memory/MemoryClass";

@MemoryClass("jobs")
export class Job extends BaseClass {
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
  }

  public init(): void {
    this.tasks.forEach(tasks => tasks.forEach(task => task.init()));
  }

  public preTick(): void {
    this.creepPool.preTick();
    this.tasks.forEach(tasks => tasks.forEach(task => task.preTick()));
  }

  public tick(): void {
    this.creepPool.tick((creep: Creep) => {
      this.logger.setRoom(this.room).log(`creep=${creep.name} task=${creep.memory.task} subTask=${creep.memory.subTask}`);
      if (!this.tasks[creep.memory.task]?.[creep.memory.subTask]) {
        return;
      }

      const task = this.tasks[creep.memory.task][creep.memory.subTask];

      const taskStatus = task.tick(creep);

      if (taskStatus === OK) {
        return;
      }

      task.releaseTarget(creep);

      if (taskStatus === ERR_INVALID_TARGET) {
        this.assignSubTask(creep);
      } else if (taskStatus === TASK_DONE) {
        this.logger.setRoom(this.room).log(`creep=${creep.name} finished task. assigning next task`);
        this.assignNextTask(creep);
      }
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
    for (let i = 0; i < this.tasks[creep.memory.task].length; i++) {
      if (this.tasks[creep.memory.task][i].targetPool.hasFreeTarget()) {
        creep.memory.subTask = i;
        this.logger.setRoom(this.room).log(`${creep.name} assigned to ${creep.memory.task}/${i}`);
        break;
      }
    }
  }
}
