import {ArrayPos, RoadPos} from "../preprocessing/Prefab";
import {CreepWrapper} from "../wrappers/CreepWrapper";
import {getDirectionBetweenPos} from "../pathfinder/PathUtils";
import {PathNavigator} from "@pathfinder/PathNavigator";

export interface PositionsEntity {
  roadPos: RoadPos;
  positions: Array<ArrayPos>;
  positionAssignments: Array<string>;
  middleIdx: number;
}

export type ShiftDirection = (1 | -1);

export function rearrangePositions(
  positionsEntity: PositionsEntity, newCreepWrapper: CreepWrapper, pathNavigator?: PathNavigator,
): void {
  if (newCreepWrapper) {
    if (makeSpaceForNewCreep(positionsEntity, 1)) {
      moveToPosition(positionsEntity, newCreepWrapper, positionsEntity.middleIdx, -1, pathNavigator);
      shiftPositions(positionsEntity, -1, positionsEntity.middleIdx - 1);
    } else {
      makeSpaceForNewCreep(positionsEntity, -1);
      moveToPosition(positionsEntity, newCreepWrapper, positionsEntity.middleIdx, -1, pathNavigator);
    }
  } else {
    shiftPositions(positionsEntity, 1);
    shiftPositions(positionsEntity, -1);
  }
}

function makeSpaceForNewCreep(positionsEntity: PositionsEntity, shiftDirection: ShiftDirection): boolean {
  const checkIdx = getIdxChecker(positionsEntity, shiftDirection);

  let foundSpaceIdx = -1;
  for (let i = positionsEntity.middleIdx; checkIdx(i); i += shiftDirection) {
    if (!positionsEntity.positionAssignments[i]) {
      foundSpaceIdx = i;
      break;
    }
  }

  if (foundSpaceIdx === -1) return false;

  const foundCheckIdx = getIdxChecker(positionsEntity, -shiftDirection as ShiftDirection);

  if (foundSpaceIdx !== positionsEntity.middleIdx) {
    for (
      let i = foundSpaceIdx - shiftDirection;
      foundCheckIdx(i);
      i -= shiftDirection
    ) {
      const creepWrapper = CreepWrapper.getEntityWrapper<CreepWrapper>(positionsEntity.positionAssignments[i]);
      moveToPosition(positionsEntity, creepWrapper, i + shiftDirection, i);

      if (i === positionsEntity.middleIdx) break;
    }
  }

  shiftPositions(positionsEntity, shiftDirection, foundSpaceIdx + shiftDirection);

  return true;
}

function shiftPositions(
  positionsEntity: PositionsEntity, shiftDirection: ShiftDirection,
  startIdx = positionsEntity.middleIdx,
): boolean {
  const checkIdx = getIdxChecker(positionsEntity, shiftDirection);
  let foundEmpty = false;
  for (let i = startIdx; checkIdx(i); i += shiftDirection) {
    if (positionsEntity.positionAssignments[i]) {
      const creepWrapper = CreepWrapper.getEntityWrapper<CreepWrapper>(positionsEntity.positionAssignments[i]);
      if (foundEmpty) {
        moveToPosition(positionsEntity, creepWrapper, i - shiftDirection, i);
      }
    } else {
      foundEmpty = true;
    }
  }
  return false;
}

function moveToPosition(
  positionsEntity: PositionsEntity, creepWrapper: CreepWrapper,
  positionIdx: number, fromPositionIdx: number, pathNavigator?: PathNavigator,
): void {
  const direction = getDirectionBetweenPos(
    [creepWrapper.entity.pos.x, creepWrapper.entity.pos.y],
    positionsEntity.positions[positionIdx]
  );
  if (creepWrapper.entity.move(direction) !== OK) return;

  positionsEntity.positionAssignments[positionIdx] = creepWrapper.id;
  if (fromPositionIdx >= 0 && positionsEntity.positionAssignments[fromPositionIdx] === creepWrapper.id) {
    positionsEntity.positionAssignments[fromPositionIdx] = "";
  }

  if (pathNavigator) pathNavigator.moveOutOfNetwork(creepWrapper);
}

export function getIdxChecker(positionsEntity: PositionsEntity, checkDirection: ShiftDirection): (idx: number) => boolean {
  return checkDirection === 1 ?
    (idx: number) => idx < positionsEntity.positionAssignments.length :
    (idx: number) => idx >= 0;
}
