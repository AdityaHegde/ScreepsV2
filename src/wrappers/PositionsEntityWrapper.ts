import {EntityWrapper} from "@wrappers/EntityWrapper";
import {inMemory} from "@memory/inMemory";
import {RoadPos} from "@pathfinder/RoadTypes";
import {ArrayPos} from "../preprocessing/Prefab";
import {
  getDirectionBetweenPos,
  getPosTowardsDirection,
  ROTATE_180_DEG, ROTATE_ANTI_CLOCKWISE,
  ROTATE_CLOCKWISE,
  rotateDirection
} from "@pathfinder/PathUtils";

export type PositionsEntityType = Source | Mineral | StructureController;

export class PositionsEntityWrapper<PositionsEntityTypeSelect extends PositionsEntityType> extends EntityWrapper<PositionsEntityTypeSelect> {
  @inMemory()
  public roadEndArrayPos: ArrayPos;

  @inMemory()
  public positions: Array<ArrayPos>;
  @inMemory()
  public positionAssignments: Array<string>;
  @inMemory()
  public middleIdx: number;

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

  private static getPosAt(
    direction: DirectionConstant,
    entityPos: ArrayPos, terrain: RoomTerrain,
  ): ArrayPos {
    const pos: ArrayPos = getPosTowardsDirection(entityPos, direction);

    if (terrain.get(pos[0], pos[1]) === TERRAIN_MASK_WALL) return null;

    return pos;
  }
}
