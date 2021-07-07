import {DIRECTION_TO_OFFSET} from "../../src/pathfinder/PathUtils";

export class CreepMovementMocks {
  private readonly maxX: number;
  private readonly maxY: number;
  private readonly creeps = new Array<Creep>();

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

  public createCreep(name: string, pos: RoomPosition): Creep {
    Memory.creeps[name] ??= {};
    const creep: any = {
      name, pos, memory: Memory.creeps[name], fatigue: 0,
    }
    creep.move = (direction: DirectionConstant) => this.move(creep, direction);
    this.grid[pos.x][pos.y] = name;

    return creep as Creep;
  }

  private move(creep: Creep, direction: DirectionConstant) {
    const offsets = DIRECTION_TO_OFFSET[direction];
    const newX = creep.pos.x + offsets[0];
    const newY = creep.pos.y + offsets[1];

    // if (this.grid[newX]?.[newY]) return OK; // Official APIs return OK even if the terrain is not path-able
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
