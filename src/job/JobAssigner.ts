import {BaseClass, BaseClassMemory} from "../BaseClass";
import {Job} from "./Job";

export interface JobAssignerMemory extends BaseClassMemory {}

export interface JobAssignerOpts {
  jobs: Array<Job>;
}

@BaseClass.Class("assigner")
export class JobAssigner extends BaseClass<JobAssignerMemory, JobAssignerOpts> {
  public readonly jobs: Array<Job>;

  public init(room: Room): void {
    this.jobs.forEach(job => job.init(room));
  }

  public preTick(room: Room): void {
    this.jobs.forEach(job => job.preTick(room));
  }

  public tick(room: Room): void {
    this.jobs.forEach(job => job.tick(room));
  }

  public postTick(room: Room): void {
    this.jobs.forEach(job => job.postTick(room));
  }

  public assign(room: Room, creep: Creep, creepPool: string): void {
    const sourceJob = this.jobs.find(job => job.creepPool.idSuffix === creepPool);

    if (!sourceJob) {
      return;
    }

    sourceJob.assign(room, creep);
  }
}
