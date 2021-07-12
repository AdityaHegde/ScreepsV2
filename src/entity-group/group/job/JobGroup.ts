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
  JobResourceIdx,
  JobSourceIdIdx,
  JobTargetIdIdx,
} from "./JobParams";
import {getWrapperById} from "@wrappers/getWrapperById";
import {Traveler} from "@pathfinder/Traveler";

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

      this.logger.log(`id=${this.id} resource=${creepWrapper.entity.store[creepWrapper.job[JobResourceIdx]]}`);

      if (creepWrapper.task === 0) {
        this.sourceAction(creepWrapper);
      }
      // this is not in else because if source action ends then we can start moving towards target
      if (creepWrapper.task === 1) {
        this.targetAction(creepWrapper);
      }
    });
  }

  private moveCreepWrapper(creepWrapper: CreepWrapper, moveTargetWrapper: EntityWrapper<BaseEntityType>): void {
    if (moveTargetWrapper.arrayPos) {
      // Traveler.travelTo(creepWrapper.entity, moveTargetWrapper.roomPos, {range: 1});
      this.pathFinder.pathNavigator.move(creepWrapper, moveTargetWrapper.arrayPos);
    }
  }

  // task = 0
  private sourceAction(creepWrapper: CreepWrapper) {
    const sourceWrapper = getWrapperById(creepWrapper.job[JobSourceIdIdx]);

    if (!isNearToArrayPos(creepWrapper.arrayPos, sourceWrapper.arrayPos)) {
      this.moveCreepWrapper(creepWrapper, sourceWrapper);
      return;
    }

    if (!sourceWrapper?.isValid()) {
      this.logger.log(`Invalid source. job=${creepWrapper.job.toString()}`);
      this.endJob(creepWrapper);
      // TODO: release target
      return;
    }

    const sourceActionReturn = this.jobGroupActions.sourceAction(creepWrapper, sourceWrapper);
    if (sourceActionReturn !== OK) {
      this.logger.log(`sourceAction failed ret=${sourceActionReturn} entityId=${sourceWrapper.id} ` +
        `(${creepWrapper.arrayPos.toString()}) (${sourceWrapper.arrayPos.toString()})`);
      return;
    }

    creepWrapper.clearMovement();
    creepWrapper.task = 1;
  }

  // task = 1
  private targetAction(creepWrapper: CreepWrapper) {
    const targetWrapper = getWrapperById(creepWrapper.job[JobTargetIdIdx]);
    if (!targetWrapper?.isValid()) {
      this.logger.log(`Invalid target. job=${creepWrapper.job.toString()}`);
      this.endJob(creepWrapper);
      return;
    }
    if (!isNearToArrayPos(creepWrapper.arrayPos, targetWrapper.arrayPos, this.jobGroupActions.range)) {
      this.moveCreepWrapper(creepWrapper, targetWrapper);
      return;
    }

    const targetActionReturn = this.jobGroupActions.targetAction(creepWrapper, targetWrapper);
    if (targetActionReturn !== OK) {
      this.logger.log(`targetAction failed ret=${targetActionReturn} entityId=${targetWrapper.id} ` +
        `(${creepWrapper.arrayPos.toString()}) (${targetWrapper.arrayPos.toString()})`);
      return;
    }
    if (!this.jobGroupActions.targetActionCompleted(creepWrapper, targetWrapper)) return;

    this.endJob(creepWrapper);
    this.jobGroupActions.actionHasCompleted(creepWrapper, targetWrapper);
  }

  private claimJob(creepWrapper: CreepWrapper): boolean {
    let claimedJob: JobParams;
    if (this.jobs.length > 0) {
      claimedJob = this.jobs.shift();
    } else {
      const capacity = creepWrapper.entity.store.getCapacity();
      for (const jobNetwork of this.jobNetworks) {
        if (jobNetwork.hasFreeJob(capacity)) {
          claimedJob = jobNetwork.claimJob(creepWrapper, capacity, capacity);
          this.logger.log(`Claiming job. id=${this.id} creep=${creepWrapper.entity.name} ` +
            `source=${claimedJob[JobSourceIdIdx]} target=${claimedJob[JobTargetIdIdx]}`);
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
    creepWrapper.job = undefined;
    creepWrapper.task = 0;
  }
}
