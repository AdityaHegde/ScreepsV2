import {CreepGroup} from "./CreepGroup";
import {inMemory} from "@memory/inMemory";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {getIdxChecker, rearrangePositions, ShiftDirection} from "@utils/rearrangePositions";
import {getWrapperById} from "@wrappers/getWrapperById";
import {EntityWrapper} from "@wrappers/EntityWrapper";
import {CreepsSpawner} from "../creeps-manager/CreepsSpawner";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {Traveler} from "@pathfinder/Traveler";
import {isNearToArrayPos} from "@pathfinder/PathUtils";
import {PositionsEntityType, PositionsEntityWrapper} from "@wrappers/PositionsEntityWrapper";
import {USE_CUSTOM_PATHFINDER} from "../../constants";

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
          if (USE_CUSTOM_PATHFINDER) {
            this.pathFinder.pathNavigator.move(creepWrapper, this.target.roadEndArrayPos);
          } else {
            Traveler.travelTo(creepWrapper.entity,
              new RoomPosition(this.target.roadEndArrayPos[0], this.target.roadEndArrayPos[1], this.room.name),
              {range: 0});
          }
          return;
        }
      }

      this.takeAction(creepWrapper);
    });

    rearrangePositions(this.target, reachedCreepWrapper, this.pathFinder.pathNavigator);

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
