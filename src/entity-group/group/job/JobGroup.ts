import {CreepGroup} from "../CreepGroup";
import {inMemory} from "@memory/inMemory";
import {
  JobNetwork
} from "./JobNetwork";
import {CreepsSpawner} from "../../creeps-manager/CreepsSpawner";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {BaseEntityType, EntityWrapper} from "@wrappers/EntityWrapper";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {isNearToArrayPos} from "@pathfinder/PathUtils";
import {JobGroupActions} from "./JobGroupActions";
import {
  JobParams,
  JobSourceEntityPoolIdx,
  JobSourceIdIdx, JobTargetEntityPoolIdx,
  JobTargetIdIdx,
} from "./JobParams";
import {getWrapperById} from "@wrappers/getWrapperById";
import {Globals} from "@globals/Globals";
import {EntityPool} from "../../entity-pool/EntityPool";
import {Traveler} from "@pathfinder/Traveler";
import {USE_CUSTOM_PATHFINDER} from "../../../constants";

export class JobGroup extends CreepGroup {
  @inMemory(() => [])
  public jobs: Array<JobParams>;

  public jobNetworks: Array<JobNetwork>;
  public jobGroupActions: JobGroupActions;

  public constructor(
    id: string, room: Room,
    creepSpawner: CreepsSpawner, pathFinder: ColonyPathFinder,
    jobNetworks: Array<JobNetwork>, jobGroupActions: JobGroupActions,
  ) {
    super(id, room, creepSpawner, pathFinder);
    this.jobNetworks = jobNetworks;
    this.jobGroupActions = jobGroupActions;
  }

  public preTick(): void {
    super.preTick();
    this.jobNetworks.forEach(haulNetwork => haulNetwork.preTick());
  }

  public tick(): void {
    this.forEachEntityWrapper((creepWrapper) => {
      if (!creepWrapper.job && !this.claimJob(creepWrapper)) return;

      if (creepWrapper.task === 0) {
        this.sourceAction(creepWrapper);
      }
      // this is not in else because if source action ends then we can start moving towards target
      if (creepWrapper.task === 1) {
        this.targetAction(creepWrapper);
      }
    }, (deadCreepWrapper) => {
      this.endJob(deadCreepWrapper);
    });
  }

  private moveCreepWrapper(creepWrapper: CreepWrapper, moveTargetWrapper: EntityWrapper<BaseEntityType>): void {
    if (moveTargetWrapper.arrayPos) {
      if (USE_CUSTOM_PATHFINDER) {
        this.pathFinder.pathNavigator.move(creepWrapper, moveTargetWrapper.arrayPos);
      } else {
        Traveler.travelTo(creepWrapper.entity, moveTargetWrapper.roomPos, {range: 1});
      }
    }
  }

  // task = 0
  private sourceAction(creepWrapper: CreepWrapper) {
    const sourceWrapper = getWrapperById(creepWrapper.job[JobSourceIdIdx]);

    if (creepWrapper.subTask === 0) {
      if (!isNearToArrayPos(creepWrapper.arrayPos, sourceWrapper.arrayPos)) {
        this.moveCreepWrapper(creepWrapper, sourceWrapper);
        return;
      }
      creepWrapper.subTask = 1;
    }

    if (!sourceWrapper?.isValid()) {
      this.logger.log(`Invalid source. job=${creepWrapper.job.toString()}`);
      this.endJob(creepWrapper);
      // TODO: release target
      return;
    }

    const sourceActionReturn = this.jobGroupActions.sourceAction(creepWrapper, sourceWrapper);
    if (sourceActionReturn !== OK) {
      this.logger.log(`entityId=${sourceWrapper.id} SourceAction failed return=${sourceActionReturn} ` +
        `(${creepWrapper.arrayPos.toString()}) (${sourceWrapper.arrayPos.toString()})`);
      return;
    } else {
      this.logger.log(`entityId=${sourceWrapper.id} Source action`);
    }

    creepWrapper.clearMovement();
    creepWrapper.task = 1;
    creepWrapper.subTask = 0;
  }

  // task = 1
  private targetAction(creepWrapper: CreepWrapper) {
    const targetWrapper = getWrapperById(creepWrapper.job[JobTargetIdIdx]);
    if (!targetWrapper?.isValid()) {
      this.logger.log(`Invalid target. job=${creepWrapper.job.toString()}`);
      this.endJob(creepWrapper);
      return;
    }
    if (creepWrapper.subTask === 0) {
      if (!isNearToArrayPos(creepWrapper.arrayPos, targetWrapper.arrayPos, this.jobGroupActions.range)) {
        this.moveCreepWrapper(creepWrapper, targetWrapper);
        return;
      }
      creepWrapper.subTask = 1;
      // creepWrapper.weight = creepWrapper.entity.store.getUsedCapacity(creepWrapper.job[JobResourceIdx]);
      // this.logger.log(`Reached target. weight=${creepWrapper.weight}`);
    }

    const targetActionReturn = this.jobGroupActions.targetAction(creepWrapper, targetWrapper);
    if (targetActionReturn !== OK) {
      this.logger.log(`entityId=${targetWrapper.id} TargetAction failed return=${targetActionReturn} ` +
        `(${creepWrapper.arrayPos.toString()}) (${targetWrapper.arrayPos.toString()})`);
      return;
    } else {
      this.logger.log(`entityId=${targetWrapper.id} Target action`);
    }
    if (!this.jobGroupActions.targetActionCompleted(creepWrapper, targetWrapper)) return;

    // TODO: if creep still has resource, acquire another target
    this.endJob(creepWrapper);
    // this.jobGroupActions.actionHasCompleted(creepWrapper, targetWrapper);
  }

  private claimJob(creepWrapper: CreepWrapper): boolean {
    let claimedJob: JobParams;
    if (this.jobs.length > 0) {
      // claimedJob = this.jobs.shift();
      // TODO: get weight and update
    } else {
      const capacity = creepWrapper.entity.store.getFreeCapacity();
      for (const jobNetwork of this.jobNetworks) {
        if (jobNetwork.hasFreeJob(capacity)) {
          claimedJob = jobNetwork.claimJob(creepWrapper, capacity, capacity);
          creepWrapper.weight = capacity;
          this.logger.log(`Claiming job. id=${this.id} creep=${creepWrapper.entity.name} ` +
            `source=${claimedJob[JobSourceIdIdx]} target=${claimedJob[JobTargetIdIdx]} weight=${creepWrapper.weight}`);
          break;
        }
      }
    }

    if (!claimedJob) return false;

    creepWrapper.job = claimedJob;
    return true;
  }

  private endJob(creepWrapper: CreepWrapper): void {
    creepWrapper.clearMovement();
    if (creepWrapper.job) {
      if (creepWrapper.task === 0) {
        Globals.getGlobal<EntityPool>(EntityPool as any, creepWrapper.job[JobSourceEntityPoolIdx])
          .releaseTarget(creepWrapper.job[JobSourceIdIdx], creepWrapper.weight);
      }
      if (Globals.getGlobal<EntityPool>(EntityPool as any, creepWrapper.job[JobTargetEntityPoolIdx])
          .releaseTarget(creepWrapper.job[JobTargetIdIdx], creepWrapper.targetWeight)) {
        this.jobGroupActions.actionHasCompleted(creepWrapper, getWrapperById(creepWrapper.job[JobTargetIdIdx]));
      }
    }
    creepWrapper.job = undefined;
    creepWrapper.task = 0;
    creepWrapper.subTask = 0;
  }
}
