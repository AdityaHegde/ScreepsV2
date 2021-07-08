import {PathFinderData} from "./PathFinderData";
import {DIRECTION_OFFSETS, getKeyFromArrayXY, hasReachedRoadPosIdx} from "./PathUtils";
import {RoadPos} from "../preprocessing/Prefab";
import {RoadConnectionEntry} from "./Road";
import {Logger} from "../utils/Logger";
import {CreepWrapper} from "@wrappers/CreepWrapper";

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

  public move(creepWrapper: CreepWrapper, pos: RoomPosition): MoveReturnValue {
    creepWrapper.lastPos = [creepWrapper.entity.pos.x, creepWrapper.entity.pos.y];
    creepWrapper.lastRoadPosIdx = -1;

    if (creepWrapper.entity.fatigue > 0) return MOVE_FAILED;

    this.logger.setRoom(creepWrapper.entity.room).setEntityWrapper(creepWrapper);

    // TODO: move this to creep creation to avoid checking this every move
    if (!creepWrapper.pos) {
      creepWrapper.pos = this.acquireRoadPos(creepWrapper.entity.pos);
    }
    if (!creepWrapper.dest) {
      creepWrapper.dest = this.acquireRoadPos(pos);
    }

    if (creepWrapper.pos[0] === creepWrapper.dest[0]) {
      return this.handleSamePathTravel(creepWrapper, creepWrapper.dest[1]);
    }

    return this.handleThroughPathTravel(creepWrapper);
  }

  public resolveMove(creepWrapper: CreepWrapper): MoveReturnValue {
    if (!creepWrapper.pos || !creepWrapper.dest) return MOVE_FAILED;
    if (creepWrapper.hasReachedDest()) return MOVE_SUCCEEDED;
    if (creepWrapper.failedToMove()) return MOVE_FAILED;

    this.logger.setRoom(creepWrapper.entity.room).setEntityWrapper(creepWrapper);

    this.pathFinderData.roads[creepWrapper.pos[0]].updatePos(creepWrapper.pos, creepWrapper.lastRoadPosIdx);

    if (creepWrapper.pos[0] === creepWrapper.dest[0]) {
      if (hasReachedRoadPosIdx(creepWrapper.pos, creepWrapper.dest)) return MOVE_COMPLETED;
      return MOVE_SUCCEEDED;
    }

    if (creepWrapper.through && creepWrapper.pos[1] === creepWrapper.through[0]) {
      creepWrapper.pos = [
        creepWrapper.through[1],
        this.pathFinderData.roads[creepWrapper.through[1]]
          .getConnectionDestRoadPosIdx(creepWrapper.pos[0], creepWrapper.through[2]),
      ];
      creepWrapper.through = undefined;
      return creepWrapper.hasReachedDest() ? MOVE_COMPLETED : MOVE_SUCCEEDED;
    }

    return MOVE_SUCCEEDED;
  }

  public resolveAndMove(creepWrapper: CreepWrapper, pos: RoomPosition): MoveReturnValue {
    if (this.resolveMove(creepWrapper) === MOVE_COMPLETED) return MOVE_COMPLETED;
    return this.move(creepWrapper, pos);
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
      if (dirKey in this.pathFinderData.roadPosMap) {
        return [...this.pathFinderData.roadPosMap[dirKey][0]];
      }
    }
  }

  private handleThroughPathTravel(creepWrapper: CreepWrapper): MoveReturnValue {
    if (!creepWrapper.through) {
      creepWrapper.through = this.acquireThroughRoadPos(creepWrapper.pos, creepWrapper.dest);
    }

    if (!creepWrapper.through) return MOVE_FAILED;

    return  this.handleSamePathTravel(creepWrapper, creepWrapper.through[0]);
  }

  private acquireThroughRoadPos(roadPos: RoadPos, destRoadPos: RoadPos): RoadConnectionEntry {
    const connection = this.pathFinderData.roads[roadPos[0]].getConnection(roadPos, destRoadPos[0]);
    if (connection) return [...connection];
    // console.log(`Missing connection. ${roadPos.toString()} ${destRoadPos.toString()}`);
    return null;
  }

  private handleSamePathTravel(creepWrapper: CreepWrapper, destRoadPosIdx: number): MoveReturnValue {
    const road = this.pathFinderData.roads[creepWrapper.pos[0]];
    const direction = road.getMoveDirection(creepWrapper.pos, destRoadPosIdx);

    this.logger.log(`Moving along pos=${creepWrapper.pos?.toString()} dest=${creepWrapper.dest?.toString()} ` +
      `road=${road.roadIdx} direction=${direction} destRoadPosIdx=${destRoadPosIdx} ` +
      `roomPosition=${creepWrapper.entity.pos.x},${creepWrapper.entity.pos.y}`);
    creepWrapper.lastRoadPosIdx = destRoadPosIdx;

    const returnValue = creepWrapper.entity.move(direction);
    // TODO: move returns OK even if the creep cannot move there for some reason
    if (returnValue !== OK) return MOVE_FAILED;

    return MOVE_SUCCEEDED;
  }
}
