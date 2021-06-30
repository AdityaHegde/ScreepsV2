import {inMemory} from "@memory/inMemory";
import {MovingEntityGroup} from "../MovingEntityGroup";
import {HarvestableEntityType, HarvestableEntityWrapper} from "../../wrappers/HarvestableEntityWrapper";
import {MOVE_COMPLETED} from "../../pathfinder/PathNavigator";
import {CreepWrapper} from "../../wrappers/CreepWrapper";
import {getIdxChecker, rearrangePositions, ShiftDirection} from "../../utils/rearrangePositions";

export class HarvestGroup<HarvestableEntityWrapperSelect extends HarvestableEntityWrapper<HarvestableEntityType>> extends MovingEntityGroup {
  @inMemory()
  public harvestTargetId: string;
  public harvestTarget: HarvestableEntityWrapperSelect;

  @inMemory()
  public containerId: string;

  public setHarvestTargetEntity(harvestTargetEntityWrapper: HarvestableEntityWrapperSelect): void {
    this.harvestTarget = harvestTargetEntityWrapper;
    this.harvestTargetId = harvestTargetEntityWrapper.id;
  }

  public setContainer(container: StructureContainer): void {
    this.containerId = container.id;
  }

  public tick(): void {
    this.harvestTarget = HarvestableEntityWrapper.getEntityWrapper(this.harvestTargetId);

    let reachedCreepWrapper: CreepWrapper;

    this.forEachEntityWrapper((creepWrapper) => {
      if (creepWrapper.task === 0) {
        creepWrapper.dest = this.harvestTarget.roadPos;
        if (this.pathFinder.resolveAndMove(creepWrapper.entity, null) === MOVE_COMPLETED) {
          creepWrapper.task = 1;
          reachedCreepWrapper = creepWrapper;
        } else {
          return;
        }
      }

      creepWrapper.entity.harvest(this.harvestTarget.entity);
    });

    rearrangePositions(this.harvestTarget, reachedCreepWrapper);

    this.depositResource();
  }

  public removeEntityWrapper(creepWrapper: CreepWrapper): void {
    super.removeEntityWrapper(creepWrapper);
    const positionIdx = this.harvestTarget.positionAssignments.indexOf(creepWrapper.id);
    this.harvestTarget.positionAssignments[positionIdx] = "";
  }

  private depositResource() {
    this.moveResourceToCenter(1);
    this.moveResourceToCenter(-1);

    const centerCreepWrapper =
      CreepWrapper.getEntityWrapper<CreepWrapper>(this.harvestTarget.positionAssignments[this.harvestTarget.middleIdx]);
    if (!centerCreepWrapper) return;

    const container = Game.getObjectById<StructureContainer>(this.containerId);
    if (container) {
      centerCreepWrapper.entity.transfer(container, this.harvestTarget.entity.resourceType);
    } else {
      centerCreepWrapper.entity.drop(this.harvestTarget.entity.resourceType);
    }
  }

  private moveResourceToCenter(positionsDirection: ShiftDirection) {
    const checkIdx = getIdxChecker(this.harvestTarget, positionsDirection);
    for (let i = this.harvestTarget.middleIdx + positionsDirection; checkIdx(i); i++) {
      const creepWrapper = CreepWrapper.getEntityWrapper<CreepWrapper>(this.harvestTarget.positionAssignments[i]);
      if (!creepWrapper) continue;

      const targetCreepWrapper =
        CreepWrapper.getEntityWrapper<CreepWrapper>(this.harvestTarget.positionAssignments[i - positionsDirection]);
      if (!targetCreepWrapper) continue;

      creepWrapper.entity.transfer(targetCreepWrapper.entity, this.harvestTarget.entity.resourceType);
    }
  }
}
