import {ArrayPos, RoadPos} from "../preprocessing/Prefab";

export const DIRECTION_TO_OFFSET: {
  [direction in DirectionConstant]: ArrayPos
} = {
  [TOP]: [0, -1],
  [TOP_RIGHT]: [1, -1],
  [RIGHT]: [1, 0],
  [BOTTOM_RIGHT]: [1, 1],
  [BOTTOM]: [0, 1],
  [BOTTOM_LEFT]: [-1, 1],
  [LEFT]: [-1, 0],
  [TOP_LEFT]: [-1, -1]
};
export const DIRECTION_OFFSETS = Object.keys(DIRECTION_TO_OFFSET).sort().map(dir => DIRECTION_TO_OFFSET[dir]) as Array<ArrayPos>;
export const OFFSET_TO_DIRECTION: {
  [offset in string]: DirectionConstant
} = {
  "0__-1": TOP,
  "1__-1": TOP_RIGHT,
  "1__0": RIGHT,
  "1__1": BOTTOM_RIGHT,
  "0__1": BOTTOM,
  "-1__1": BOTTOM_LEFT,
  "-1__0": LEFT,
  "-1__-1": TOP_LEFT
};
export const ROTATE_180_DEG = 4;
export const ROTATE_CLOCKWISE = 1;
export const ROTATE_ANTI_CLOCKWISE = 7;

export function getKeyFromArrayPos(arrayPos: ArrayPos): string {
  return getKeyFromArrayXY(arrayPos[0], arrayPos[1]);
}
export function getKeyFromRoomPosition(roomPosition: RoomPosition): string {
  return getKeyFromArrayXY(roomPosition.x, roomPosition.y);
}
export function getKeyFromArrayXY(x: number, y: number): string {
  return `${x}__${y}`;
}

export function getDirectionBetweenPos(sourcePos: ArrayPos, destPos: ArrayPos): DirectionConstant {
  const dx = Math.sign(destPos[0] - sourcePos[0]);
  const dy = Math.sign(destPos[1] - sourcePos[1]);
  return OFFSET_TO_DIRECTION[getKeyFromArrayXY(dx, dy)];
}

export function getPosTowardsDirection(sourcePos: ArrayPos, direction: DirectionConstant): ArrayPos {
  const offset = DIRECTION_TO_OFFSET[direction];
  return [sourcePos[0] + offset[0], sourcePos[1] + offset[1]];
}

export function isAdjacentToPos(sourcePos: ArrayPos, destPos: ArrayPos): (DirectionConstant | -2) {
  const dx = Math.abs(destPos[0] - sourcePos[0]);
  const dy = Math.abs(destPos[1] - sourcePos[1]);

  if (dx > 1 || dy > 1) {
    return -2;
  }

  return getDirectionBetweenPos(sourcePos, destPos);
}

export function isNearToRoomPosition(sourcePos: RoomPosition, destPos: RoomPosition, range = 1): boolean {
  const dx = Math.abs(destPos.x - sourcePos.x);
  const dy = Math.abs(destPos.y - sourcePos.y);
  return Math.max(dx, dy) <= range;
}
export function isNearToArrayPos(sourcePos: ArrayPos, arrayPos: ArrayPos, range = 1): boolean {
  const dx = Math.abs(arrayPos[0] - sourcePos[0]);
  const dy = Math.abs(arrayPos[1] - sourcePos[1]);
  return Math.max(dx, dy) <= range;
}

export function rotateDirection(direction: DirectionConstant, times: number): DirectionConstant {
  return (((direction + times - 1) % 8) + 1) as DirectionConstant;
}

export function hasReachedRoadPos(sourceRoadPos: RoadPos, destRoadPos: RoadPos): boolean {
  return sourceRoadPos[0] === destRoadPos[0] && hasReachedRoadPosIdx(sourceRoadPos, destRoadPos);
}
export function hasReachedRoadPosIdx(sourceRoadPos: RoadPos, destRoadPos: RoadPos): boolean {
  return sourceRoadPos[1] === destRoadPos[1];
}
