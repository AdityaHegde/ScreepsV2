import {BaseClass} from "src/BaseClass";
import {CreepPool} from "./creep-pool/CreepPool";
import {JobMemory} from "./JobMemory";
import {Task} from "src/task/Task";
import {TASK_DONE} from "../constants";
import {Logger} from "../utils/Logger";

export interface JobOpts {
  creepPool: CreepPool;
  tasks: Array<Array<Task<any, any>>>;
}

@BaseClass.Class("jobs")
export class Job extends BaseClass<JobMemory, JobOpts> {
  public readonly creepPool: CreepPool;
  protected readonly tasks: Array<Array<Task<any, any>>>;

  protected logger = new Logger("Job");

  public init(room: Room): void {
    this.tasks.forEach(tasks => tasks.forEach(task => task.init(room)));
  }

  public preTick(room: Room): void {
    this.creepPool.preTick(room);
    this.tasks.forEach(tasks => tasks.forEach(task => task.preTick(room)));
  }

  public tick(room: Room): void {
    this.creepPool.tick(room, (creep: Creep) => {
      this.logger.setRoom(room).log(`creep=${creep.name} task=${creep.memory.task} subTask=${creep.memory.subTask}`);
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
        this.assignSubTask(room, creep);
      } else if (taskStatus === TASK_DONE) {
        this.logger.setRoom(room).log(`creep=${creep.name} finished task. assigning next task`);
        this.assignNextTask(room, creep);
      }
    });
  }

  public postTick(room: Room): void {
    this.creepPool.postTick(room);
    this.tasks.forEach(tasks => tasks.forEach(task => task.postTick(room)));
  }

  public assign(room: Room, creep: Creep): void {
    this.assignNextTask(room, creep, 0);
  }

  protected assignNextTask(
    room: Room, creep: Creep,
    nextTask = (creep.memory.task + 1) % this.tasks.length,
  ): void {
    creep.memory.task = nextTask;
    this.assignSubTask(room, creep);
  }

  protected assignSubTask(room: Room, creep: Creep): void {
    for (let i = 0; i < this.tasks[creep.memory.task].length; i++) {
      if (this.tasks[creep.memory.task][i].targetPool.getTargetPoolInstance(room).hasFreeTarget()) {
        creep.memory.subTask = i;
        this.logger.setRoom(room).log(`${creep.name} assigned to ${creep.memory.task}/${i}`);
        break;
      }
    }
  }
}
