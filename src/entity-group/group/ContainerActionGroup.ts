import {CreepGroup} from "./CreepGroup";
import {inMemory} from "@memory/inMemory";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {getIdxChecker, rearrangePositions, ShiftDirection} from "@utils/rearrangePositions";
import {getWrapperById} from "@wrappers/getWrapperById";
import {EntityWrapper} from "@wrappers/EntityWrapper";
import {CreepsSpawner} from "../creeps-manager/CreepsSpawner";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {isNearToArrayPos} from "@pathfinder/PathUtils";
import {PositionsEntityType, PositionsEntityWrapper} from "@wrappers/PositionsEntityWrapper";

export class ContainerActionGroup<ContainerActionGroupTargetType extends
  PositionsEntityWrapper<PositionsEntityType>> extends CreepGroup {

  @inMemory()
  public targetId: string;
  public target: ContainerActionGroupTargetType;

  @inMemory()
  public containerId: string;
  public container: EntityWrapper<StructureContainer>;

  @inMemory()
  public hasHaul: boolean;

  private powerByPosition: Array<number>;
  private totalPower: number;

  public setContainer(container: StructureContainer): void {
    this.containerId = container.id;
  }

  public constructor(
    id: string, room: Room,
    creepSpawner: CreepsSpawner, pathFinder: ColonyPathFinder,
    target: ContainerActionGroupTargetType,
  ) {
    super(id, room, creepSpawner, pathFinder);
    this.target =  target;
    this.targetId = target.id;
  }

  public tick(): void {
    this.target = getWrapperById(this.targetId) as ContainerActionGroupTargetType;
    this.container = this.containerId ? getWrapperById(this.containerId) as EntityWrapper<StructureContainer> : null;

    let reachedCreepWrapper: CreepWrapper;

    this.forEachEntityWrapper((creepWrapper) => {
      if (creepWrapper.task === 0) {
        if (isNearToArrayPos(creepWrapper.arrayPos, this.target.roadEndArrayPos, 0)) {
          if (creepWrapper.entity.fatigue === 0) {
            creepWrapper.task = 1;
            creepWrapper.clearMovement();
            reachedCreepWrapper = creepWrapper;
            this.logger.log(`reached ${creepWrapper.entity.pos.x},${creepWrapper.entity.pos.y}`);
          }
        } else {
          this.pathFinder.pathNavigator.move(creepWrapper, this.target.roadEndArrayPos);
          return;
        }
      }

      this.takeAction(creepWrapper);
    });

    rearrangePositions(this.target as any, reachedCreepWrapper, this.pathFinder.pathNavigator);

    this.takeActions();
  }

  public removeEntityWrapper(creepWrapper: CreepWrapper): void {
    super.removeEntityWrapper(creepWrapper);
    const positionIdx = this.target.positionAssignments.indexOf(creepWrapper.id);
    this.target.positionAssignments[positionIdx] = "";
  }

  protected takeAction(creepWrapper: CreepWrapper): void {
    // to implement
  }

  protected middleCreepAction(creepWrapper: CreepWrapper, totalPower: number): void {
    // to implement
  }

  protected sideCreepActionToContainer(creepWrapper: CreepWrapper): void {
    this.middleCreepAction(creepWrapper, this.totalPower);
  }

  protected sideCreepActionToAnother(creepWrapper: CreepWrapper, targetCreepWrapper: CreepWrapper, powerLeft: number): void {
    // to implement
  }

  private takeActions() {
    this.powerByPosition = this.target.positionAssignments.map(() => 0);
    this.totalPower = 0;
    this.getPowerByPosition(1);
    this.getPowerByPosition(-1);

    const centerCreepWrapper = this.target.positionAssignments[this.target.middleIdx] ?
      CreepWrapper.getEntityWrapper<CreepWrapper>(this.target.positionAssignments[this.target.middleIdx]) : null;
    if (centerCreepWrapper) {
      this.totalPower += centerCreepWrapper.power;
    }

    this.moveResources(1);
    this.moveResources(-1);

    if (!this.target.positionAssignments[this.target.middleIdx]) return;
    this.middleCreepAction(centerCreepWrapper, this.totalPower);
  }

  private moveResources(positionsDirection: ShiftDirection) {
    const checkIdx = getIdxChecker(this.target as any, positionsDirection);
    for (let i = this.target.middleIdx + positionsDirection; checkIdx(i); i += positionsDirection) {
      if (!this.target.positionAssignments[i]) continue;
      const creepWrapper = CreepWrapper.getEntityWrapper<CreepWrapper>(this.target.positionAssignments[i]);

      if (this.container && isNearToArrayPos(creepWrapper.arrayPos, this.container.arrayPos)) {
        this.sideCreepActionToContainer(creepWrapper);
        return;
      }

      if (!this.target.positionAssignments[i - positionsDirection]) continue;
      const targetCreepWrapper =
        CreepWrapper.getEntityWrapper<CreepWrapper>(this.target.positionAssignments[i - positionsDirection]);

      this.sideCreepActionToAnother(creepWrapper, targetCreepWrapper, this.powerByPosition[i]);
    }
  }

  private getPowerByPosition(positionsDirection: ShiftDirection) {
    const checkIdx = positionsDirection === 1 ? (idx => idx < this.target.middleIdx) : (idx => idx > this.target.middleIdx);

    for (
      let i = positionsDirection === 1 ? 0 : this.target.positionAssignments.length - 1, power = 0;
      checkIdx(i); i += positionsDirection
    ) {
      if (this.target.positionAssignments[i]) {
        const creepWrapper = CreepWrapper.getEntityWrapper<CreepWrapper>(this.target.positionAssignments[i]);
        power += creepWrapper.power;
        this.totalPower += creepWrapper.power;
      }
      this.powerByPosition[i] = power;
    }
  }
}
