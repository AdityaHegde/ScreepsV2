import {BaseClass} from "../BaseClass";
import {Job} from "./Job";
import {MemoryClass} from "@memory/MemoryClass";
import {JOB_ASSIGNER_ID} from "../constants";
import {getIdFromRoom} from "../utils/getIdFromRoom";

@MemoryClass("assigner")
export class JobAssigner extends BaseClass {
  public readonly jobs: Array<Job>;

  public constructor(id: string, room: Room, jobs: Array<Job>) {
    super(id, room);
    this.jobs = jobs;
  }

  public init(): void {
    this.jobs.forEach(job => job.init());
  }

  public preTick(): void {
    this.jobs.forEach(job => job.preTick());
  }

  public tick(): void {
    this.jobs.forEach(job => job.tick());
  }

  public postTick(): void {
    this.jobs.forEach(job => job.postTick());
  }

  public assign(creep: Creep, creepPoolId: string): void {
    const sourceJob = this.jobs.find(job => job.creepPool.id === creepPoolId);

    if (!sourceJob) {
      return;
    }

    sourceJob.assign(creep);
  }

  public static getJobAssigner(room: Room, jobs: Array<Job>): JobAssigner {
    return new JobAssigner(getIdFromRoom(room, JOB_ASSIGNER_ID), room, jobs);
  }
}
