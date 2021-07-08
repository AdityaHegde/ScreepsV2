import {CreepGroup} from "./CreepGroup";
import {inMemory} from "@memory/inMemory";
import {
  JobNetwork,
  JobParams,
  JobResourceTypeIdx,
  JobSourceIdIdx,
  JobSourcePosIdx,
  JobTargetIdIdx,
  JobTargetPosIdx
} from "./JobNetwork";
import {CreepsSpawner} from "../creeps-manager/CreepsSpawner";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {BaseEntityType, EntityWrapper} from "@wrappers/EntityWrapper";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {getWrapperById} from "@wrappers/getWrapperById";
import {MOVE_COMPLETED} from "@pathfinder/PathNavigator";
import {isNearToRoomPosition} from "@pathfinder/PathUtils";
import {JobGroupActions} from "./JobGroupActions";

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

      this.logger.log(`id=${this.id} resource=${creepWrapper.entity.store[creepWrapper.job[JobResourceTypeIdx]]}`);

      if (creepWrapper.task % 2 === 0) {
        if (!this.moveCreepWrapper(creepWrapper)) return;
      }
      if (creepWrapper.task === 1) {
        this.sourceAction(creepWrapper);
      } else {
        this.targetAction(creepWrapper);
      }
    });
  }

  public addJob(
    sourceEntity: BaseEntityType, targetEntity: BaseEntityType, resource: ResourceConstant,
  ): void {
    this.jobs.push([
      this.pathFinder.acquireRoadPos(sourceEntity.pos), sourceEntity.id, null,
      this.pathFinder.acquireRoadPos(targetEntity.pos), targetEntity.id, null,
      resource,
    ]);
  }

  // task = 0/2
  private moveCreepWrapper(creepWrapper: CreepWrapper): boolean {
    const sourceWrapper = getWrapperById(creepWrapper.job[creepWrapper.task === 0 ? JobSourceIdIdx : JobTargetIdIdx]);
    const moveReturn = this.pathFinder.resolveAndMove(creepWrapper, null);
    if (moveReturn === MOVE_COMPLETED || isNearToRoomPosition(creepWrapper.entity.pos, sourceWrapper.entity.pos)) {
      creepWrapper.task++;
      return true;
    }
    return false;
  }

  // task = 1
  private sourceAction(creepWrapper: CreepWrapper) {
    const sourceWrapper = getWrapperById(creepWrapper.job[JobSourceIdIdx]);
    if (this.jobGroupActions.sourceAction(creepWrapper, sourceWrapper) === OK) {
      creepWrapper.clearMovement(creepWrapper.job[JobTargetPosIdx]);
      creepWrapper.task = 2;
    }
  }

  // task = 3
  private targetAction(creepWrapper: CreepWrapper) {
    const targetWrapper = getWrapperById(creepWrapper.job[JobTargetIdIdx]);
    const transferReturn = this.jobGroupActions.targetAction(creepWrapper, targetWrapper);
    if (transferReturn === OK) {
      creepWrapper.clearMovement();
      creepWrapper.job = undefined;
      creepWrapper.task = 0;
    } else {
      this.logger.log(`Transfer failed ret=${transferReturn} ` +
        `${creepWrapper.entity.pos.x},${creepWrapper.entity.pos.y} ` +
        `${targetWrapper.entity.pos.x},${targetWrapper.entity.pos.y}`)
    }
  }

  private claimJob(creepWrapper: CreepWrapper): boolean {
    let claimedJob: JobParams;
    // might have become empty after assigning to another creep
    if (this.jobs.length > 0) {
      claimedJob = this.jobs.shift();
    } else {
      for (const jobNetwork of this.jobNetworks) {
        if (jobNetwork.hasFreeJob()) {
          claimedJob = jobNetwork.claimJob(
            creepWrapper,
            this.jobGroupActions.sourceWeightMultiplier * creepWrapper.power,
            this.jobGroupActions.targetWeightMultiplier * creepWrapper.power,
          );
          break;
        }
      }
    }

    if (!claimedJob) return false;

    creepWrapper.job = claimedJob;
    creepWrapper.dest = creepWrapper.job[JobSourcePosIdx];
    return true;
  }
}
