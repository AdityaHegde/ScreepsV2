import {CreepGroup} from "../CreepGroup";
import {HaulJobParams} from "./HaulJob";
import {inMemory} from "@memory/inMemory";
import {MOVE_COMPLETED} from "@pathfinder/PathNavigator";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {getWrapperById} from "@wrappers/getWrapperById";
import {HaulNetwork} from "./HaulNetwork";
import {CreepsSpawner} from "../../creeps-manager/CreepsSpawner";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";

export class HaulGroup extends CreepGroup {
  @inMemory()
  public haulJobs: Array<HaulJobParams>;

  public haulNetworks: Array<HaulNetwork>;

  public constructor(
    id: string, room: Room,
    creepSpawner: CreepsSpawner, pathFinder: ColonyPathFinder,
    haulNetworks: Array<HaulNetwork>,
  ) {
    super(id, room, creepSpawner, pathFinder);
    this.haulNetworks = haulNetworks;
  }

  public preTick(): void {
    super.preTick();
    this.haulNetworks.forEach(haulNetwork => haulNetwork.preTick());
  }

  public tick(): void {
    this.forEachEntityWrapper((creepWrapper) => {
      if (!creepWrapper.haulJob && !this.claimHaulJob(creepWrapper)) return;

      if (creepWrapper.task % 2 === 0) {
        this.moveCreepWrapper(creepWrapper);
      } else if (creepWrapper.task === 1) {
        this.pickupFromSource(creepWrapper);
      } else {
        this.dropOffToTarget(creepWrapper);
      }
    });
  }

  // task = 0/2
  private moveCreepWrapper(creepWrapper: CreepWrapper) {
    if (this.pathFinder.resolveAndMove(creepWrapper.entity, null) === MOVE_COMPLETED) {
      creepWrapper.task++;
    }
  }

  // task = 1
  private pickupFromSource(creepWrapper: CreepWrapper) {
    const sourceWrapper = getWrapperById(creepWrapper.haulJob[1]);
    if (((sourceWrapper.entity instanceof Resource) && creepWrapper.entity.pickup(sourceWrapper.entity) === OK)) {
      creepWrapper.dest = creepWrapper.haulJob[2];
      creepWrapper.task = 2;
    }
  }

  // task = 3
  private dropOffToTarget(creepWrapper: CreepWrapper) {
    const targetWrapper = getWrapperById(creepWrapper.haulJob[3]);
    if (creepWrapper.entity.transfer(targetWrapper.entity, creepWrapper.haulJob[4]) === OK) {
      creepWrapper.haulJob = undefined;
      creepWrapper.dest = undefined;
    }
  }

  private claimHaulJob(creepWrapper: CreepWrapper): boolean {
    let claimedHaulJob: HaulJobParams;
    // might have become empty after assigning to another creep
    if (this.haulJobs.length > 0) {
      claimedHaulJob = this.haulJobs.shift();
    } else {
      for (const haulNetwork of this.haulNetworks) {
        if (haulNetwork.hasFreeJob()) {
          claimedHaulJob = haulNetwork.claimJob(creepWrapper);
          break;
        }
      }
    }

    if (!claimedHaulJob) return false;

    creepWrapper.haulJob = claimedHaulJob;
    creepWrapper.dest = creepWrapper.haulJob[0];
    return true;
  }
}
