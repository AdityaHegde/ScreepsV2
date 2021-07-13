import {DIRECTION_TO_OFFSET} from "@pathfinder/PathUtils";

export class RoomGrid {
  private readonly maxX: number;
  private readonly maxY: number;

  public readonly grid: Record<number, Record<number, string>> = {};

  public constructor(maxX: number, maxY: number) {
    this.maxX = maxX;
    this.maxY = maxY;
    for (let x = 0; x < maxX; x++) {
      this.grid[x] = {};
      for (let y = 0; y < maxY; y++) {
        this.grid[x][y] = "";
      }
    }
  }

  public move(creep: Creep, direction: DirectionConstant) {
    const offsets = DIRECTION_TO_OFFSET[direction];
    const newX = creep.pos.x + offsets[0];
    const newY = creep.pos.y + offsets[1];

    if (newX < 0 || newX > this.maxX || newY < 0 || newY > this.maxY) return ERR_INVALID_ARGS;

    this.grid[newX][newY] = creep.name;
    if (this.grid[creep.pos.x][creep.pos.y] === creep.name) {
      this.grid[creep.pos.x][creep.pos.y] = "";
    }
    creep.pos.x = newX;
    creep.pos.y = newY;

    return OK;
  }
}
