import {PathFinderData} from "./PathFinderData";
import {
  DIRECTION_OFFSETS,
  getKeyFromArrayPos,
  getKeyFromArrayXY,
  getPosTowardsDirection,
  ROTATE_180_DEG, rotateDirection
} from "./PathUtils";
import {ArrayPos} from "../preprocessing/Prefab";
import {Logger} from "@utils/Logger";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {
  RoadConnectionCurRoadPosIdx,
  RoadConnectionDestRoadConnectionIdx,
  RoadConnectionDestRoadIdx, RoadConnectionEntry, RoadPos, RoadPosDirectionIdx, RoadPosRoadIdx, RoadPosRoadPosIdx
} from "@pathfinder/RoadTypes";

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

  public preTick(): void {
    this.pathFinderData.movedCreepWrapperIds.forEach((movedCreepWrapperId) => {
      const movedCreepWrapper = CreepWrapper.getEntityWrapper<CreepWrapper>(movedCreepWrapperId);

      if (!movedCreepWrapper.entity || movedCreepWrapper.failedToMove()) return;

      const oldKey = getKeyFromArrayPos(movedCreepWrapper.lastPos);
      if (this.pathFinderData.creepsInRoad[oldKey] === movedCreepWrapper.id) {
        delete this.pathFinderData.creepsInRoad[oldKey];
      }
      const newKey = getKeyFromArrayXY(movedCreepWrapper.entity.pos.x, movedCreepWrapper.entity.pos.y);
      // only add if the new pos in on a road
      if (newKey in this.pathFinderData.roadPosMap) {
        this.pathFinderData.creepsInRoad[newKey] = movedCreepWrapper.id;
      }

      movedCreepWrapper.currentMoveDirection = undefined;
      movedCreepWrapper.path?.shift();
    });
    this.pathFinderData.preTick();
  }

  public move(creepWrapper: CreepWrapper, pos: ArrayPos, shouldMoveIntoTarget = false): void {
    if (creepWrapper.entity.fatigue > 0) return;

    if (!creepWrapper.path) {
      creepWrapper.path = this.getPath(creepWrapper, pos, shouldMoveIntoTarget);
    } else if (creepWrapper.path.length === 0) {
      return;
    }

    creepWrapper.currentMoveDirection = creepWrapper.path[0];

    const newKey = getKeyFromArrayPos(getPosTowardsDirection(
      [creepWrapper.entity.pos.x, creepWrapper.entity.pos.y], creepWrapper.currentMoveDirection));
    if (newKey in this.pathFinderData.creepsInRoad) {
      if (!this.pathFinderData.moveConflictPoints.has(newKey)) {
        this.pathFinderData.moveConflictPoints.set(newKey, [creepWrapper.id]);
      } else {
        this.pathFinderData.moveConflictPoints.get(newKey).push(creepWrapper.id);
      }
    }
    this.pathFinderData.queuedCreepWrappers.push(creepWrapper);
  }

  public moveOutOfNetwork(creepWrapper: CreepWrapper): void {
    const creepKey = getKeyFromArrayXY(creepWrapper.entity.pos.x, creepWrapper.entity.pos.y);
    if (this.pathFinderData.creepsInRoad[creepKey] === creepWrapper.id) {
      delete this.pathFinderData.creepsInRoad[creepKey];
    }
  }

  public postTick(): void {
    this.pathFinderData.moveConflictPoints.forEach((conflictingCreeps, moveConflictPoint) => {
      const selectedCreepWrapper = CreepWrapper.getEntityWrapper<CreepWrapper>(conflictingCreeps[0]);
      const existingCreepWrapper =
        CreepWrapper.getEntityWrapper<CreepWrapper>(this.pathFinderData.creepsInRoad[moveConflictPoint]);
      if (!existingCreepWrapper.currentMoveDirection) {
        existingCreepWrapper.currentMoveDirection =
          rotateDirection(selectedCreepWrapper.currentMoveDirection, ROTATE_180_DEG);
        this.pathFinderData.queuedCreepWrappers.push(existingCreepWrapper);
      }
    });

    this.pathFinderData.queuedCreepWrappers.forEach((queuedCreepWrapper) => {
      if (!queuedCreepWrapper.entity) return;
      queuedCreepWrapper.lastPos = [queuedCreepWrapper.entity.pos.x, queuedCreepWrapper.entity.pos.y];
      this.logger.setRoom(queuedCreepWrapper.entity.room).setEntityWrapper(queuedCreepWrapper)
        .log(`Moving in direction=${queuedCreepWrapper.currentMoveDirection} distance=${queuedCreepWrapper.path?.length} ` +
          `roomPosition=${queuedCreepWrapper.entity.pos.x},${queuedCreepWrapper.entity.pos.y}`);
      if (queuedCreepWrapper.entity.move(queuedCreepWrapper.currentMoveDirection) === OK) {
        this.pathFinderData.movedCreepWrapperIds.push(queuedCreepWrapper.id);
      }
    });
  }

  private getPath(creepWrapper: CreepWrapper, targetArrayPos: ArrayPos, shouldMoveIntoTarget = false): Array<DirectionConstant> {
    const path = new Array<DirectionConstant>();

    const curRoadPos = this.acquireRoadPosFromRoomPosition(creepWrapper.entity.pos);
    const endRoadPos = this.acquireRoadPosFromArrayPos(targetArrayPos);

    // if creep has moved out of road, add a direction to move it back in.
    if (curRoadPos[RoadPosDirectionIdx]) {
      path.push(rotateDirection(curRoadPos[RoadPosDirectionIdx], ROTATE_180_DEG));
    }

    while (curRoadPos[RoadPosRoadIdx] !== endRoadPos[RoadPosRoadIdx] ||
    curRoadPos[RoadPosRoadPosIdx] !== endRoadPos[RoadPosRoadPosIdx]) {
      let immediateEndRoadIdx: number;
      let immediateEndRoadPosIdx: number;
      let throughRoad: RoadConnectionEntry;

      if (curRoadPos[RoadPosRoadIdx] === endRoadPos[RoadPosRoadIdx]) {
        // same road travel
        immediateEndRoadIdx = endRoadPos[RoadPosRoadIdx];
        immediateEndRoadPosIdx = endRoadPos[RoadPosRoadPosIdx];
      } else {
        // through road travel
        throughRoad = this.acquireThroughRoadPos(curRoadPos, endRoadPos);
        immediateEndRoadIdx = throughRoad[RoadConnectionDestRoadIdx];
        immediateEndRoadPosIdx = throughRoad[RoadConnectionCurRoadPosIdx];
      }

      // console.log(`(${curRoadPos.toString()}) => (${immediateEndRoadIdx},${immediateEndRoadPosIdx}) => (${endRoadPos.toString()})`);

      path.push(...this.pathFinderData.roads[curRoadPos[RoadPosRoadIdx]]
        .getRoadPath(curRoadPos[RoadPosRoadPosIdx], immediateEndRoadPosIdx));

      if (throughRoad) {
        curRoadPos[RoadPosRoadPosIdx] = this.pathFinderData.roads[immediateEndRoadIdx]
          .getConnectionDestRoadPosIdx(curRoadPos[RoadPosRoadIdx], throughRoad[RoadConnectionDestRoadConnectionIdx]);
      } else {
        curRoadPos[RoadPosRoadPosIdx] = immediateEndRoadPosIdx;
      }
      curRoadPos[RoadPosRoadIdx] = immediateEndRoadIdx;
    }

    // if end pos is outside the road add the direction towards it
    if (endRoadPos[RoadPosDirectionIdx] && shouldMoveIntoTarget) {
      path.push(endRoadPos[RoadPosDirectionIdx]);
    }

    return path;
  }

  private acquireRoadPosFromRoomPosition(pos: RoomPosition): RoadPos {
    return this.acquireRoadPosFromXY(pos.x, pos.y);
  }

  private acquireRoadPosFromArrayPos(pos: ArrayPos): RoadPos {
    return this.acquireRoadPosFromXY(pos[0], pos[1]);
  }

  private acquireRoadPosFromXY(x: number, y: number): RoadPos {
    const key = getKeyFromArrayXY(x, y);
    if (this.pathFinderData.roadPosMap[key]?.length) {
      return [...this.pathFinderData.roadPosMap[key][0]];
    } else if (this.pathFinderData.posToRoadMap[key]?.length) {
      return [...this.pathFinderData.posToRoadMap[key][0]];
    }
    for (const directionOffset of DIRECTION_OFFSETS) {
      const dirKey = getKeyFromArrayXY(x + directionOffset[0], y + directionOffset[1]);
      if (dirKey in this.pathFinderData.roadPosMap) {
        return [...this.pathFinderData.roadPosMap[dirKey][0]];
      }
    }
  }

  private acquireThroughRoadPos(roadPos: RoadPos, destRoadPos: RoadPos): RoadConnectionEntry {
    const connection = this.pathFinderData.roads[roadPos[0]].getConnection(roadPos, destRoadPos[0]);
    if (!connection) return null;
    return [...connection];
  }
}
