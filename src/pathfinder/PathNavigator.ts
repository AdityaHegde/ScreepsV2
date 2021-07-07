import {PathFinderData} from "./PathFinderData";
import {DIRECTION_OFFSETS, getKeyFromArrayXY, hasReachedRoadPos, hasReachedRoadPosIdx} from "./PathUtils";
import {RoadPos} from "../preprocessing/Prefab";
import {RoadConnectionEntry} from "./Road";
import {Logger} from "../utils/Logger";

// failed to move for some reason, ie creep.move returned non OK
export const MOVE_FAILED = "failed";
// moved succeeded, ie creep.move returned OK
export const MOVE_SUCCEEDED = "succeeded";
// move succeeded & completed, ie creep has reached its target road position
export const MOVE_COMPLETED = "completed";
export type MoveReturnValue = typeof MOVE_FAILED | typeof MOVE_SUCCEEDED | typeof MOVE_COMPLETED;

export class PathNavigator {
  public readonly pathFinderData: PathFinderData;

  private readonly logger = new Logger("PathNavigator");

  public constructor(pathFinderData: PathFinderData) {
    this.pathFinderData = pathFinderData;
  }

  public move(creep: Creep, pos: RoomPosition): MoveReturnValue {
    creep.memory.lastPos = [creep.pos.x, creep.pos.y];
    creep.memory.lastRoadPosIdx = -1;

    if (creep.fatigue > 0) return MOVE_FAILED;

    this.logger.setRoom(creep.room).setCreep(creep);

    // TODO: move this to creep creation to avoid checking this every move
    if (!creep.memory.pos) {
      creep.memory.pos = this.acquireRoadPos(creep.pos);
    }
    if (!creep.memory.dest) {
      creep.memory.dest = this.acquireRoadPos(pos);
    }

    this.logger.log(`Moving pos=${creep.memory.pos?.toString()} dest=${creep.memory.dest?.toString()}`);

    if (creep.memory.pos[0] === creep.memory.dest[0]) {
      return this.handleSamePathTravel(creep, creep.memory.dest[1]);
    }

    return this.handleThroughPathTravel(creep);
  }

  public resolveMove(creep: Creep): MoveReturnValue {
    if (!creep.memory.pos || !creep.memory.dest) return MOVE_FAILED;
    if (hasReachedRoadPos(creep.memory.pos, creep.memory.dest)) return MOVE_SUCCEEDED;
    if (creep.memory.lastRoadPosIdx >=0 &&
        creep.memory.lastPos[0] === creep.pos.x && creep.memory.lastPos[1] === creep.pos.y) return MOVE_FAILED;

    this.logger.setRoom(creep.room).setCreep(creep);

    this.pathFinderData.roads[creep.memory.pos[0]].updatePos(creep.memory.pos, creep.memory.lastRoadPosIdx);

    if (creep.memory.pos[0] === creep.memory.dest[0]) {
      if (hasReachedRoadPosIdx(creep.memory.pos, creep.memory.dest)) return MOVE_COMPLETED;
      return MOVE_SUCCEEDED;
    }

    if (creep.memory.pos[1] === creep.memory.through[0]) {
      creep.memory.pos = [
        creep.memory.through[1],
        this.pathFinderData.roads[creep.memory.through[1]]
          .getConnectionDestRoadPosIdx(creep.memory.pos[0], creep.memory.through[2]),
      ];
      delete creep.memory.through;
      return hasReachedRoadPos(creep.memory.pos, creep.memory.dest) ? MOVE_COMPLETED : MOVE_SUCCEEDED;
    }

    return MOVE_SUCCEEDED;
  }

  public resolveAndMove(creep: Creep, pos: RoomPosition): MoveReturnValue {
    if (this.resolveMove(creep) === MOVE_COMPLETED) return MOVE_COMPLETED;
    return this.move(creep, pos);
  }

  public acquireRoadPos(pos: RoomPosition): RoadPos {
    const key = getKeyFromArrayXY(pos.x, pos.y);
    if (this.pathFinderData.roadPosMap[key]?.length) {
      return [...this.pathFinderData.roadPosMap[key][0]];
    } else if (this.pathFinderData.posToRoadMap[key]?.length) {
      return [...this.pathFinderData.posToRoadMap[key][0]];
    }
    for (const directionOffset of DIRECTION_OFFSETS) {
      const dirKey = getKeyFromArrayXY(pos.x+directionOffset[0], pos.y+directionOffset[1]);
      if (!(dirKey in this.pathFinderData.roadPosMap)) {
        return [...this.pathFinderData.roadPosMap[dirKey][0]];
      }
    }
  }

  private handleThroughPathTravel(creep: Creep): MoveReturnValue {
    if (!creep.memory.through) {
      creep.memory.through = this.acquireThroughRoadPos(creep.memory.pos, creep.memory.dest);
    }

    if (!creep.memory.through) return MOVE_FAILED;

    return  this.handleSamePathTravel(creep, creep.memory.through[0]);
  }

  private acquireThroughRoadPos(roadPos: RoadPos, destRoadPos: RoadPos): RoadConnectionEntry {
    const connection = this.pathFinderData.roads[roadPos[0]].getConnection(roadPos, destRoadPos[0]);
    if (connection) return [...connection];
    // console.log(`Missing connection. ${roadPos.toString()} ${destRoadPos.toString()}`);
    return null;
  }

  private handleSamePathTravel(creep: Creep, destRoadPosIdx: number): MoveReturnValue {
    const road = this.pathFinderData.roads[creep.memory.pos[0]];
    const direction = road.getMoveDirection(creep.memory.pos, destRoadPosIdx);

    this.logger.log(`Moving along road=${road.roadIdx} direction=${direction} destRoadPosIdx=${destRoadPosIdx}`);
    creep.memory.lastRoadPosIdx = destRoadPosIdx;

    const returnValue = creep.move(direction);
    // TODO: move returns OK even if the creep cannot move there for some reason
    if (returnValue !== OK) return MOVE_FAILED;

    return MOVE_SUCCEEDED;
  }
}
