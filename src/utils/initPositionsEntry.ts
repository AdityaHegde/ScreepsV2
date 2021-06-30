import {ArrayPos} from "../preprocessing/Prefab";
import {
  getDirectionBetweenPos,
  getPosTowardsDirection,
  ROTATE_180_DEG,
  ROTATE_ANTI_CLOCKWISE,
  ROTATE_CLOCKWISE,
  rotateDirection
} from "../pathfinder/PathUtils";
import {PositionsEntity} from "./rearrangePositions";

export function initPositionsEntry(
  positionsEntity: PositionsEntity, terrain: RoomTerrain,
  roadEndArrayPos: ArrayPos, entityPos: RoomPosition,
): void {
  const directionToEntity = getDirectionBetweenPos(roadEndArrayPos, [entityPos.x, entityPos.y])
  const initDirection = rotateDirection(directionToEntity, ROTATE_180_DEG);
  const correctedEntityPos = getPosTowardsDirection(roadEndArrayPos, directionToEntity);
  const directions: Array<DirectionConstant> = [initDirection];
  const positions: Array<ArrayPos> = [roadEndArrayPos];

  const rotationStack = [{rot: ROTATE_CLOCKWISE, dir: 1}, {rot: ROTATE_ANTI_CLOCKWISE, dir: -1}];

  for (let i = 0; i < rotationStack.length && directions.length < 3; i++) {
    const rotEntry = rotationStack.shift();

    const dir = rotateDirection(initDirection, rotEntry.rot);
    const pos = getPosAt(positionsEntity, dir, correctedEntityPos, terrain);
    if (pos) {
      const method = rotEntry.dir === 1 ? "push" : "unshift";
      directions[method](dir);
      positions[method](pos);
      rotationStack.push({rot: rotEntry.rot + rotEntry.dir, dir: rotEntry.dir});
    }
  }

  positionsEntity.positions = positions;
  positionsEntity.positionAssignments = positions.map(() => "");
  positionsEntity.middleIdx = directions.indexOf(initDirection);
}

function getPosAt(
  positionsEntity: PositionsEntity, direction: DirectionConstant,
  entityPos: ArrayPos, terrain: RoomTerrain,
): ArrayPos {
  const pos: ArrayPos = getPosTowardsDirection(entityPos, direction);

  if (terrain.get(pos[0], pos[1]) === TERRAIN_MASK_WALL) return null;

  return pos;
}