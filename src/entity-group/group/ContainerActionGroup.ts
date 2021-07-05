import {CreepGroup} from "./CreepGroup";
import {inMemory} from "@memory/inMemory";
import {HarvestableEntityWrapper} from "@wrappers/HarvestableEntityWrapper";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {MOVE_COMPLETED} from "@pathfinder/PathNavigator";
import {getIdxChecker, rearrangePositions, ShiftDirection} from "@utils/rearrangePositions";
import {ControllerWrapper} from "@wrappers/ControllerWrapper";
import {getWrapperById} from "@wrappers/getWrapperById";
import {EntityWrapper} from "@wrappers/EntityWrapper";
import {CreepsSpawner} from "../creeps-manager/CreepsSpawner";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";

export class ContainerActionGroup extends CreepGroup {
  @inMemory()
  public targetId: string;
  public target: ControllerWrapper | HarvestableEntityWrapper<any>;

  @inMemory()
  public containerId: string;
  public container: EntityWrapper<StructureContainer>;

  public setContainer(container: StructureContainer): void {
    this.containerId = container.id;
  }

  public constructor(
    id: string, room: Room,
    creepSpawner: CreepsSpawner, pathFinder: ColonyPathFinder,
    target: ControllerWrapper | HarvestableEntityWrapper<any>,
  ) {
    super(id, room, creepSpawner, pathFinder);
    this.target =  target;
    this.targetId = target.id;
  }

  public tick(): void {
    this.target = getWrapperById(this.targetId) as (ControllerWrapper | HarvestableEntityWrapper<any>);
    this.container = this.containerId ? getWrapperById(this.containerId) as EntityWrapper<StructureContainer> : null;

    let reachedCreepWrapper: CreepWrapper;

    this.forEachEntityWrapper((creepWrapper) => {
      if (creepWrapper.task === 0) {
        creepWrapper.dest = this.target.roadPos;
        if (this.pathFinder.resolveAndMove(creepWrapper.entity, null) === MOVE_COMPLETED) {
          creepWrapper.task = 1;
          reachedCreepWrapper = creepWrapper;
        } else {
          return;
        }
      }

      this.takeAction(creepWrapper);
    });

    rearrangePositions(this.target, reachedCreepWrapper);

    this.depositResource();
  }

  public removeEntityWrapper(creepWrapper: CreepWrapper): void {
    super.removeEntityWrapper(creepWrapper);
    const positionIdx = this.target.positionAssignments.indexOf(creepWrapper.id);
    this.target.positionAssignments[positionIdx] = "";
  }

  protected takeAction(creepWrapper: CreepWrapper): void {
    // to implement
  }

  protected middleCreepAction(creepWrapper: CreepWrapper): void {
    // to implement
  }

  protected sideCreepActionToContainer(creepWrapper: CreepWrapper): void {
    this.middleCreepAction(creepWrapper);
  }

  protected sideCreepActionToAnother(creepWrapper: CreepWrapper, targetCreepWrapper: CreepWrapper): void {
    // to implement
  }

  private depositResource() {
    this.moveResourceToCenter(1);
    this.moveResourceToCenter(-1);

    if (!this.target.positionAssignments[this.target.middleIdx]) return;
    const centerCreepWrapper =
      CreepWrapper.getEntityWrapper<CreepWrapper>(this.target.positionAssignments[this.target.middleIdx]);

    this.middleCreepAction(centerCreepWrapper);
  }

  private moveResourceToCenter(positionsDirection: ShiftDirection) {
    const checkIdx = getIdxChecker(this.target, positionsDirection);
    for (let i = this.target.middleIdx + positionsDirection; checkIdx(i); i += positionsDirection) {
      if (!this.target.positionAssignments[i]) continue;
      const creepWrapper = CreepWrapper.getEntityWrapper<CreepWrapper>(this.target.positionAssignments[i]);

      if (this.container) {
        this.sideCreepActionToContainer(creepWrapper);
        return;
      }

      if (!this.target.positionAssignments[i - positionsDirection]) continue;
      const targetCreepWrapper =
        CreepWrapper.getEntityWrapper<CreepWrapper>(this.target.positionAssignments[i - positionsDirection]);

      this.sideCreepActionToAnother(creepWrapper, targetCreepWrapper);
    }
  }
}
