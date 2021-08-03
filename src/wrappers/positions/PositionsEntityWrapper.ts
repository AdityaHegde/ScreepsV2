import {GameEntity} from "@wrappers/GameEntity";
import {inMemory} from "@memory/inMemory";
import {ArrayPos} from "../../preprocessing/Prefab";
import {
  getDirectionBetweenPos,
  getPosTowardsDirection, isNearToArrayPos,
  ROTATE_180_DEG, ROTATE_ANTI_CLOCKWISE,
  ROTATE_CLOCKWISE,
  rotateDirection
} from "@pathfinder/PathUtils";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {getWrapperById} from "@wrappers/getWrapperById";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {wrapperFromMemory} from "@memory/wrapperFromMemory";
import {CreepsSpawner} from "@wrappers/creeps-spawner/CreepsSpawner";
import {Entity} from "@wrappers/Entity";

type ShiftDirection = (1 | -1)

export type PositionsEntityType = Source | Mineral | StructureController;

export class PositionsEntityWrapper<PositionsEntityTypeSelect extends PositionsEntityType> extends GameEntity<PositionsEntityTypeSelect> {
  @inMemory()
  public roadEndArrayPos: ArrayPos;

  @inMemory()
  public positions: Array<ArrayPos>;
  @inMemory()
  public positionAssignments: Array<string>;
  @inMemory()
  public middleIdx: number;
  @inMemory(() => [])
  public movingCreeps: Array<string>;

  @inMemory()
  public containerId: string;
  @wrapperFromMemory("containerId")
  public container: GameEntity<StructureContainer>;

  @inMemory()
  public hasHaul: boolean;

  public totalCreepIds: Array<string>;

  public readonly pathFinder: ColonyPathFinder;
  public readonly creepSpawner: CreepsSpawner;

  private totalPower: number;

  public constructor(id: string, creepSpawner: CreepsSpawner, pathFinder: ColonyPathFinder) {
    super(id);
    this.creepSpawner = creepSpawner;
    this.pathFinder = pathFinder;
  }

  public updateEntity(entity: PositionsEntityTypeSelect): this {
    super.updateEntity(entity);
    if (this.positions?.length) {
      this.arrayPos = this.positions[this.middleIdx];
    }
    return this;
  }

  public setContainer(container: StructureContainer): void {
    this.containerId = container.id;
  }

  public addEntity(entity: Entity): void {
    this.movingCreeps.push(entity.id);
  }

  public shouldSpawnCreep(): boolean {
    return this.creepSpawner.shouldSpawnCreeps(this.totalCreepIds, this.totalPower);
  }

  public init(
    adjacentArrayPos: ArrayPos, roadEndArrayPos: ArrayPos,
  ): void {
    this.roadEndArrayPos = roadEndArrayPos;

    const terrain = new Room.Terrain(this.entity.room.name);
    const directionToEntity = getDirectionBetweenPos(adjacentArrayPos, [this.entity.pos.x, this.entity.pos.y]);
    const initDirection = rotateDirection(directionToEntity, ROTATE_180_DEG);
    const correctedEntityPos = getPosTowardsDirection(adjacentArrayPos, directionToEntity);
    const directions: Array<DirectionConstant> = [initDirection];
    const positions: Array<ArrayPos> = [adjacentArrayPos];

    const rotationStack = [{rot: ROTATE_CLOCKWISE, dir: 1}, {rot: ROTATE_ANTI_CLOCKWISE, dir: -1}];

    for (let i = 0; i < rotationStack.length && directions.length < 3; i++) {
      const rotEntry = rotationStack.shift();

      const dir = rotateDirection(initDirection, rotEntry.rot);
      const pos = PositionsEntityWrapper.getPosAt(dir, correctedEntityPos, terrain);
      if (pos) {
        const method = rotEntry.dir === 1 ? "push" : "unshift";
        directions[method](dir);
        positions[method](pos);
        rotationStack.push({rot: rotEntry.rot + rotEntry.dir, dir: rotEntry.dir});
      }
    }

    this.positions = positions;
    this.positionAssignments = positions.map(() => "");
    this.middleIdx = directions.indexOf(initDirection);
  }

  public run(): void {
    let reachedCreepWrapper: CreepWrapper;
    let reachedCreepIdx: number;

    this.totalCreepIds = [];

    this.movingCreeps.forEach((movingCreepId, idx) => {
      const creepWrapper = getWrapperById(movingCreepId) as CreepWrapper;
      if (isNearToArrayPos(creepWrapper.arrayPos, this.roadEndArrayPos, 0)) {
        if (creepWrapper.entity.fatigue === 0) {
          this.logger.setEntityWrapper(creepWrapper).log(`Creep reached. pos=(${creepWrapper.arrayPos.toString()})`);
          creepWrapper.clearMovement();
          reachedCreepWrapper = creepWrapper;
          reachedCreepIdx = idx;
        } else {
          this.totalCreepIds.push(movingCreepId);
        }
      } else {
        this.pathFinder.pathNavigator.move(creepWrapper, this.roadEndArrayPos);
        this.totalCreepIds.push(movingCreepId);
        return;
      }
    });

    this.rearrangePositions(reachedCreepWrapper);

    this.takeActions();

    if (reachedCreepIdx !== undefined) {
      this.movingCreeps.splice(reachedCreepIdx, 1);
    }
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

  private rearrangePositions(newCreepWrapper: CreepWrapper): void {
    // clear any dead creeps
    this.positionAssignments.forEach((creepId, idx) => {
      if (!creepId) return;
      const creepWrapper = CreepWrapper.getEntityWrapper<CreepWrapper>(creepId);
      if (!creepWrapper?.isValid()) {
        this.positionAssignments[idx] = "";
        creepWrapper.destroy();
      }
    });

    if (newCreepWrapper) {
      if (this.makeSpaceForNewCreep(1)) {
        this.moveToPosition(newCreepWrapper, this.middleIdx, -1);
        this.shiftPositions(-1, this.middleIdx - 1);
      } else {
        this.makeSpaceForNewCreep(-1);
        this.moveToPosition(newCreepWrapper, this.middleIdx, -1);
      }
      this.pathFinder?.pathNavigator.moveOutOfNetwork(newCreepWrapper);
    } else {
      this.shiftPositions(1);
      this.shiftPositions(-1);
    }
  }

  private static getPosAt(
    direction: DirectionConstant,
    entityPos: ArrayPos, terrain: RoomTerrain,
  ): ArrayPos {
    const pos: ArrayPos = getPosTowardsDirection(entityPos, direction);

    if (terrain.get(pos[0], pos[1]) === TERRAIN_MASK_WALL) return null;

    return pos;
  }

  private makeSpaceForNewCreep(shiftDirection: ShiftDirection): boolean {
    const checkIdx = this.getIdxChecker(shiftDirection);

    // find an empty space to move away from center.
    // this will make space for new creep at the center.
    let foundSpaceIdx = -1;
    for (let i = this.middleIdx; checkIdx(i); i += shiftDirection) {
      if (!this.positionAssignments[i]) {
        foundSpaceIdx = i;
        break;
      }
    }

    if (foundSpaceIdx === -1) return false;

    const foundCheckIdx = this.getIdxChecker(-shiftDirection as ShiftDirection);

    if (foundSpaceIdx !== this.middleIdx) {
      for (
        let i = foundSpaceIdx - shiftDirection;
        foundCheckIdx(i);
        i -= shiftDirection
      ) {
        const creepWrapper = CreepWrapper.getEntityWrapper<CreepWrapper>(this.positionAssignments[i]);
        this.moveToPosition(creepWrapper, i + shiftDirection, i);

        if (i === this.middleIdx) break;
      }
    }

    this.shiftPositions(shiftDirection, foundSpaceIdx + shiftDirection);

    return true;
  }

  private shiftPositions(
    shiftDirection: ShiftDirection,
    startIdx = this.middleIdx,
  ): boolean {
    const checkIdx = this.getIdxChecker(shiftDirection);
    let foundEmpty = false;
    for (let i = startIdx; checkIdx(i); i += shiftDirection) {
      if (this.positionAssignments[i]) {
        const creepWrapper = CreepWrapper.getEntityWrapper<CreepWrapper>(this.positionAssignments[i]);
        if (foundEmpty) {
          this.moveToPosition(creepWrapper, i - shiftDirection, i);
        }
      } else {
        foundEmpty = true;
      }
    }
    return false;
  }

  private moveToPosition(
    creepWrapper: CreepWrapper, positionIdx: number,
    fromPositionIdx: number,
  ): void {
    const direction = getDirectionBetweenPos(
      [creepWrapper.entity.pos.x, creepWrapper.entity.pos.y],
      this.positions[positionIdx]
    );
    if (creepWrapper.entity.move(direction) !== OK) return;

    this.positionAssignments[positionIdx] = creepWrapper.id;
    if (fromPositionIdx >= 0 && this.positionAssignments[fromPositionIdx] === creepWrapper.id) {
      this.positionAssignments[fromPositionIdx] = "";
    }
  }

  private takeActions() {
    this.totalPower = 0;

    const centerCreepWrapper = this.positionAssignments[this.middleIdx] ?
      CreepWrapper.getEntityWrapper<CreepWrapper>(this.positionAssignments[this.middleIdx]) : null;
    if (centerCreepWrapper?.isValid()) {
      this.totalPower += centerCreepWrapper.power;
    }

    this.moveResources(1);
    this.moveResources(-1);

    if (!centerCreepWrapper?.isValid()) return;
    this.logger.setEntityWrapper(centerCreepWrapper);
    this.takeAction(centerCreepWrapper);
    this.middleCreepAction(centerCreepWrapper, this.totalPower);
  }

  private moveResources(positionsDirection: ShiftDirection) {
    for (
      let i = positionsDirection === 1 ? 0 : this.positionAssignments.length - 1, power = 0;
      i !== this.middleIdx; i += positionsDirection
    ) {
      if (!this.positionAssignments[i]) continue;
      const creepWrapper = CreepWrapper.getEntityWrapper<CreepWrapper>(this.positionAssignments[i]);
      if (!creepWrapper?.isValid()) continue;
      power += creepWrapper.power;
      this.totalPower += creepWrapper.power;
      this.totalCreepIds.push(this.positionAssignments[i]);

      this.logger.setEntityWrapper(creepWrapper);

      this.takeAction(creepWrapper);

      if (!this.positionAssignments[i + positionsDirection]) continue;
      const targetCreepWrapper =
        CreepWrapper.getEntityWrapper<CreepWrapper>(this.positionAssignments[i + positionsDirection]);

      this.sideCreepActionToAnother(creepWrapper, targetCreepWrapper, power);
    }
  }

  private getIdxChecker(checkDirection: ShiftDirection): (idx: number) => boolean {
    return checkDirection === 1 ?
      (idx: number) => idx < this.positionAssignments.length :
      (idx: number) => idx >= 0;
  }
}
