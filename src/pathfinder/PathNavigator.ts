import {PathFinderData} from "./PathFinderData";
import {
  DIRECTION_OFFSETS,
  getKeyFromArrayPos,
  getKeyFromArrayXY,
  getPosTowardsDirection,
  ROTATE_180_DEG, rotateDirection
} from "./PathUtils";
import {ArrayPos, RoadPos} from "../preprocessing/Prefab";
import {
  RoadConnectionCurRoadPosIdx,
  RoadConnectionDestRoadConnectionIdx,
  RoadConnectionDestRoadIdx,
  RoadConnectionEntry
} from "./Road";
import {Logger} from "@utils/Logger";
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

  public preTick(): void {
    this.pathFinderData.movedCreepWrapperIds.forEach((movedCreepWrapperId) => {
      const movedCreepWrapper = CreepWrapper.getEntityWrapper<CreepWrapper>(movedCreepWrapperId);

      if (!movedCreepWrapper.entity || movedCreepWrapper.failedToMove() ||
        !movedCreepWrapper.pos || !movedCreepWrapper.dest) return;

      const oldKey = getKeyFromArrayPos(movedCreepWrapper.lastPos);
      if (this.pathFinderData.creepsInRoad[oldKey] === movedCreepWrapper.id) {
        delete this.pathFinderData.creepsInRoad[oldKey];
      }
      const newKey = getKeyFromArrayXY(movedCreepWrapper.entity.pos.x, movedCreepWrapper.entity.pos.y);
      if (newKey in this.pathFinderData.roadPosMap) {
        this.pathFinderData.creepsInRoad[newKey] = movedCreepWrapper.id;
      }

      this.pathFinderData.roads[movedCreepWrapper.pos[0]].updatePos(movedCreepWrapper.pos, movedCreepWrapper.destRoadPosIdx);
      movedCreepWrapper.currentMoveDirection = undefined;

      if (movedCreepWrapper.pos[0] === movedCreepWrapper.dest[0]) return;

      if (movedCreepWrapper.through && movedCreepWrapper.pos[1] === movedCreepWrapper.through[RoadConnectionCurRoadPosIdx]) {
        movedCreepWrapper.pos = [
          movedCreepWrapper.through[RoadConnectionDestRoadIdx],
          this.pathFinderData.roads[movedCreepWrapper.through[RoadConnectionDestRoadIdx]]
            .getConnectionDestRoadPosIdx(movedCreepWrapper.pos[0], movedCreepWrapper.through[RoadConnectionDestRoadConnectionIdx]),
        ];
        movedCreepWrapper.through = undefined;
      }
    });
    this.pathFinderData.preTick();
  }

  public move(creepWrapper: CreepWrapper, pos: RoomPosition): void {
    if (creepWrapper.entity.fatigue > 0) return;

    creepWrapper.lastPos = [creepWrapper.entity.pos.x, creepWrapper.entity.pos.y];

    // TODO: move this to creep creation to avoid checking this every move
    if (!creepWrapper.pos) {
      creepWrapper.pos = this.acquireRoadPosFromRoomPosition(creepWrapper.entity.pos);
    }
    if (!creepWrapper.dest) {
      creepWrapper.dest = this.acquireRoadPosFromRoomPosition(pos);
    }

    if (creepWrapper.pos[0] === creepWrapper.dest[0]) {
      this.handleSamePathTravel(creepWrapper, creepWrapper.dest[1]);
    } else {
      this.handleThroughPathTravel(creepWrapper);
    }
  }

  public moveOutOfNetwork(creepWrapper: CreepWrapper): void {
    const creepKey = getKeyFromArrayXY(creepWrapper.entity.pos.x, creepWrapper.entity.pos.y);
    if (this.pathFinderData.creepsInRoad[creepKey] === creepWrapper.id) {
      delete this.pathFinderData.creepsInRoad[creepKey];
    }
  }

  public postTick(): void {
    const conflictCreeps = new Set<string>();
    const processedConflictPoint = new Set<string>();

    this.pathFinderData.moveConflictPoints.forEach((moveConflictPoint) => {
      if (processedConflictPoint.has(moveConflictPoint)) return;
      const selectedCreepWrapper = this.pathFinderData.moveTargetPoints[moveConflictPoint][0];

      if (moveConflictPoint in this.pathFinderData.creepsInRoad) {
        const existingCreepWrapper =
          CreepWrapper.getEntityWrapper<CreepWrapper>(this.pathFinderData.creepsInRoad[moveConflictPoint]);
        if (existingCreepWrapper.currentMoveDirection) {
          // TODO
        } else {
          existingCreepWrapper.currentMoveDirection =
            rotateDirection(selectedCreepWrapper.currentMoveDirection, ROTATE_180_DEG);
          existingCreepWrapper.lastPos = [existingCreepWrapper.entity.pos.x, existingCreepWrapper.entity.pos.y];
          this.pathFinderData.queuedCreepWrappers.push(existingCreepWrapper);
        }
      }

      for (let i = 1; i < this.pathFinderData.moveTargetPoints[moveConflictPoint].length; i++) {
        conflictCreeps.add(this.pathFinderData.moveTargetPoints[moveConflictPoint][i].id);
      }
    });

    this.pathFinderData.queuedCreepWrappers.forEach((queuedCreepWrapper) => {
      if (conflictCreeps.has(queuedCreepWrapper.id)) return;
      this.logger.setRoom(queuedCreepWrapper.entity.room).setEntityWrapper(queuedCreepWrapper)
        .log(`Moving along pos=${queuedCreepWrapper.pos?.toString()} dest=${queuedCreepWrapper.dest?.toString()} ` +
          `road=${queuedCreepWrapper.pos?.[0]} direction=${queuedCreepWrapper.currentMoveDirection} ` +
          `destRoadPosIdx=${queuedCreepWrapper.destRoadPosIdx} ` +
          `roomPosition=${queuedCreepWrapper.entity.pos.x},${queuedCreepWrapper.entity.pos.y}`);
      if (queuedCreepWrapper.entity.move(queuedCreepWrapper.currentMoveDirection) === OK) {
        this.pathFinderData.movedCreepWrapperIds.push(queuedCreepWrapper.id);
      }
    });
  }

  public acquireRoadPosFromRoomPosition(pos: RoomPosition): RoadPos {
    return this.acquireRoadPosFromXY(pos.x, pos.y);
  }

  public acquireRoadPosFromArrayPos(pos: ArrayPos): RoadPos {
    return this.acquireRoadPosFromXY(pos[0], pos[1]);
  }

  public acquireRoadPosFromXY(x: number, y: number): RoadPos {
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

  private handleThroughPathTravel(creepWrapper: CreepWrapper): void {
    if (!creepWrapper.through) {
      creepWrapper.through = this.acquireThroughRoadPos(creepWrapper.pos, creepWrapper.dest);
    }

    // if creep is already at connection point
    if (creepWrapper.pos[1] === creepWrapper.through[RoadConnectionCurRoadPosIdx]) {
      creepWrapper.pos = [
        creepWrapper.through[RoadConnectionDestRoadIdx],
        this.pathFinderData.roads[creepWrapper.through[RoadConnectionDestRoadIdx]]
          .getConnectionDestRoadPosIdx(creepWrapper.pos[0], creepWrapper.through[RoadConnectionDestRoadConnectionIdx]),
      ];
      if (creepWrapper.pos[0] === creepWrapper.dest[0]) {
        this.handleSamePathTravel(creepWrapper, creepWrapper.dest[1]);
        return;
      } else {
        creepWrapper.through = this.acquireThroughRoadPos(creepWrapper.pos, creepWrapper.dest);
      }
    }

    if (!creepWrapper.through) return;

    this.handleSamePathTravel(creepWrapper, creepWrapper.through[0]);
  }

  private acquireThroughRoadPos(roadPos: RoadPos, destRoadPos: RoadPos): RoadConnectionEntry {
    const connection = this.pathFinderData.roads[roadPos[0]].getConnection(roadPos, destRoadPos[0]);
    if (!connection) return null;
    return [...connection];
  }

  private handleSamePathTravel(creepWrapper: CreepWrapper, destRoadPosIdx: number): void {
    const road = this.pathFinderData.roads[creepWrapper.pos[0]];
    const direction = road.getMoveDirection(creepWrapper.pos, destRoadPosIdx);

    creepWrapper.destRoadPosIdx = destRoadPosIdx;
    creepWrapper.currentMoveDirection = direction;

    this.pathFinderData.queuedCreepWrappers.push(creepWrapper);
    const moveToKey = getKeyFromArrayPos(getPosTowardsDirection(
      [creepWrapper.entity.pos.x, creepWrapper.entity.pos.y], direction));
    if (moveToKey in this.pathFinderData.moveTargetPoints) {
      this.pathFinderData.moveTargetPoints[moveToKey].push(creepWrapper);
    } else {
      this.pathFinderData.moveTargetPoints[moveToKey] = [creepWrapper];
    }
    if (this.pathFinderData.moveTargetPoints[moveToKey].length === 2 ||
      (moveToKey in this.pathFinderData.creepsInRoad)) {
      this.pathFinderData.moveConflictPoints.add(moveToKey);
    }
  }
}
