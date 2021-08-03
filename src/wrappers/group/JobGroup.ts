import {EntityGroup} from "@wrappers/group/EntityGroup";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {WeightedGroup} from "@wrappers/group/WeightedGroup";
import {
  JobParams, JobResourceIdx,
  JobSourceGroupIdx,
  JobSourceIdIdx, JobTarget, JobTargetGroupIdx,
  JobTargetIdIdx, JobTargetsIdx, JobTargetWeightIdx
} from "./JobParams";
import {Globals} from "@globals/Globals";
import {BaseEntityType, GameEntity} from "@wrappers/GameEntity";
import {getWrapperById} from "@wrappers/getWrapperById";
import {isNearToArrayPos} from "@pathfinder/PathUtils";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {JobGroupActions} from "@wrappers/group/JobGroupActions";
import {JobNetwork} from "@wrappers/group/JobNetwork";
import {CreepsSpawner} from "@wrappers/creeps-spawner/CreepsSpawner";

export const JobSourceState = 0;
export const JobInitialTargetState = 1;
export const JobTargetState = 2;
export const JobMovingSubState = 0;
export const JobActionSubState = 1;

export class JobGroup extends EntityGroup<CreepWrapper> {
  public readonly jobNetworks: Array<JobNetwork>;
  public readonly jobActions: JobGroupActions;
  public readonly pathFinder: ColonyPathFinder;

  public constructor(
    id: string, creepSpawner: CreepsSpawner, pathFinder: ColonyPathFinder,
    jobNetworks: Array<JobNetwork>, jobActions: JobGroupActions,
  ) {
    super(id, creepSpawner);
    this.jobNetworks = jobNetworks;
    this.jobActions = jobActions;
    this.pathFinder = pathFinder;
  }

  public run(): void {
    this.forEachEntity((creepWrapper: CreepWrapper) => {
      if (!creepWrapper.job && !this.claimJob(creepWrapper)) return;

      if (creepWrapper.state === JobSourceState) {
        this.sourceAction(creepWrapper);
      }
      // this is not in else because if source action ends then we can start moving towards target
      if (creepWrapper.state >= JobInitialTargetState) {
        this.targetAction(creepWrapper);
      }
    }, (creepWrapper: CreepWrapper) => {
      this.endJob(creepWrapper);
    });
  }

  public shouldSpawnCreep(): boolean {
    return this.creepSpawner.shouldSpawnCreeps(this.entityIds, 0);
  }

  private moveCreepWrapper(creepWrapper: CreepWrapper, moveTargetWrapper: GameEntity<BaseEntityType>): void {
    if (moveTargetWrapper.arrayPos) {
      this.pathFinder.pathNavigator.move(creepWrapper, moveTargetWrapper.arrayPos);
    }
  }

  // task = 0
  private sourceAction(creepWrapper: CreepWrapper) {
    const sourceWrapper = getWrapperById(creepWrapper.job[JobSourceIdIdx]);

    if (creepWrapper.subState === JobMovingSubState) {
      if (!isNearToArrayPos(creepWrapper.arrayPos, sourceWrapper.arrayPos)) {
        this.moveCreepWrapper(creepWrapper, sourceWrapper);
        return;
      }
      creepWrapper.subState = JobActionSubState;
    }

    if (!sourceWrapper?.isValid()) {
      this.logger.log(`Invalid source. job=${creepWrapper.job.toString()}`);
      this.endJob(creepWrapper);
      // TODO: release target
      return;
    }

    const sourceActionReturn = sourceWrapper.jobSource(creepWrapper);
    if (sourceActionReturn !== OK) {
      this.logger.log(`entityId=${sourceWrapper.id} SourceAction failed return=${sourceActionReturn} ` +
        `(${creepWrapper.arrayPos.toString()}) (${sourceWrapper.arrayPos.toString()})`);
      return;
    } else {
      this.logger.log(`entityId=${sourceWrapper.id} Source action`);
    }

    creepWrapper.clearMovement();
    creepWrapper.state = JobInitialTargetState;
    creepWrapper.subState = JobMovingSubState;
  }

  // task = 1
  private targetAction(creepWrapper: CreepWrapper) {
    const targetWrapper = getWrapperById(creepWrapper.job[JobTargetsIdx][0][JobTargetIdIdx]);
    if (!targetWrapper?.isValid()) {
      this.logger.log(`Invalid target. job=${creepWrapper.job.toString()}`);
      this.endCurrentTarget(creepWrapper);
      return;
    }
    if (creepWrapper.subState === JobMovingSubState) {
      if (!isNearToArrayPos(creepWrapper.arrayPos, targetWrapper.arrayPos, this.jobActions.range)) {
        this.moveCreepWrapper(creepWrapper, targetWrapper);
        return;
      }
      creepWrapper.subState = JobActionSubState;
      if (creepWrapper.state === JobInitialTargetState) {
        creepWrapper.weight = creepWrapper.entity.store.getUsedCapacity(creepWrapper.job[JobResourceIdx]);
        creepWrapper.state = JobTargetState;
      }
    }

    const targetActionReturn = this.jobActions.targetAction(creepWrapper, targetWrapper);
    if (targetActionReturn !== OK) {
      this.logger.log(`entityId=${targetWrapper.id} TargetAction failed return=${targetActionReturn} ` +
        `(${creepWrapper.arrayPos.toString()}) (${targetWrapper.arrayPos.toString()})`);
      return;
    } else {
      this.logger.log(`entityId=${targetWrapper.id} Target action`);
    }
    if (creepWrapper.targetWeight > 0 && creepWrapper.weight > 0 && targetWrapper.entity) return;

    this.endCurrentTarget(creepWrapper);
  }

  private claimJob(creepWrapper: CreepWrapper): boolean {
    const capacity = creepWrapper.entity.store.getFreeCapacity();
    const foundJobNetwork = this.jobNetworks.find(jobNetwork => jobNetwork.hasJob(capacity));
    if (!foundJobNetwork) return false;

    creepWrapper.weight = capacity;
    creepWrapper.job = foundJobNetwork.claimJob(capacity);
    creepWrapper.targetWeight = creepWrapper.job[JobTargetsIdx][0][JobTargetWeightIdx];
    creepWrapper.state = JobSourceState;
    creepWrapper.subState = JobMovingSubState;

    this.logger.log(`Claiming job. id=${this.id} creep=${creepWrapper.entity.name} ` +
      `source=${creepWrapper.job[JobSourceIdIdx]} targets=${creepWrapper.job[JobTargetsIdx].length} weight=${creepWrapper.weight}`);

    return true;
  }

  private endCurrentTarget(creepWrapper: CreepWrapper): void {
    this.endTarget(creepWrapper, creepWrapper.job[JobTargetsIdx].shift(), creepWrapper.targetWeight);

    if (creepWrapper.job[JobTargetsIdx].length === 0) {
      this.endJob(creepWrapper);
    } else {
      creepWrapper.targetWeight = creepWrapper.job[JobTargetsIdx][0][JobTargetWeightIdx];
      creepWrapper.subState = JobMovingSubState;
    }
  }

  private endJob(creepWrapper: CreepWrapper): void {
    creepWrapper.clearMovement();
    if (creepWrapper.job) {
      if (creepWrapper.state === 0) {
        Globals.getGlobal<WeightedGroup>(WeightedGroup as any, creepWrapper.job[JobSourceGroupIdx])
          .releaseTarget(creepWrapper.job[JobSourceIdIdx], creepWrapper.weight);
      }
      creepWrapper.job[JobTargetsIdx].forEach(jobTarget => this.endTarget(creepWrapper, jobTarget));
    }
    creepWrapper.job = undefined;
    creepWrapper.state = undefined;
    creepWrapper.subState = undefined;
  }

  private endTarget(creepWrapper: CreepWrapper, jobTarget: JobTarget, targetWeight: number = jobTarget[JobTargetWeightIdx]) {
    this.logger.log(`Ending. target=[${jobTarget.toString()}]`)
    if (Globals.getGlobal<WeightedGroup>(WeightedGroup as any, jobTarget[JobTargetGroupIdx])
          .releaseTarget(jobTarget[JobTargetIdIdx], targetWeight)) {
      this.jobActions.targetCompleted(creepWrapper, getWrapperById(jobTarget[JobTargetIdIdx]));
    }
  }
}
