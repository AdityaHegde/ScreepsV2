import {BaseClass} from "../BaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {ArrayPos, RoadPos} from "../preprocessing/Prefab";
import {getDirectionBetweenPos, isAdjacentToPos, ROTATE_180_DEG, rotateDirection} from "./PathUtils";
import {findInArray} from "../utils/StatsUtils";

export type RoadDirection = [forward: number, backwards: number];
export type RoadConnection = number;
export type RoadIndirectConnection = [roadIdx: number, distance: number];
export type RoadConnectionEntry = [curRoadPosIdx: number, destRoadIdx: number, destRoadConnectionIdx: number];

@MemoryClass("road")
export class Road extends BaseClass {
  public readonly roadIdx: number;

  @inMemory(() => [])
  public roadDirections: Array<RoadDirection>;

  @inMemory(() => [])
  public roadIds: Array<string>;

  @inMemory(() => [])
  public connections: Array<Array<RoadConnection>>;
  @inMemory(() => [])
  public indirectConnections: Array<Array<RoadIndirectConnection>>;

  @inMemory(() => false)
  public isCircular: boolean;

  public constructor(id: string, roadIdx: number) {
    super(id);
    this.roadIdx = roadIdx;
  }

  public addArrayOfPos(arrayOfPos: Array<ArrayPos>): this {
    for (let i = 0; i < arrayOfPos.length; i++) {
      const roadDirection: RoadDirection = [0, 0];

      if (i < arrayOfPos.length - 1) {
        roadDirection[0] = getDirectionBetweenPos(arrayOfPos[i], arrayOfPos[i + 1]);
      }
      if (i > 0) {
        roadDirection[1] = getDirectionBetweenPos(arrayOfPos[i], arrayOfPos[i - 1]);
      }

      this.roadDirections.push(roadDirection);
    }

    if (arrayOfPos.length > 4) {
      const loopDirection = isAdjacentToPos(arrayOfPos[arrayOfPos.length - 1], arrayOfPos[0]);
      if (loopDirection !== -2) {
        if (loopDirection) {
          this.roadDirections[this.roadDirections.length - 1][0] = loopDirection;
          this.roadDirections.push([0, rotateDirection(loopDirection, ROTATE_180_DEG)]);
        }
        this.addDirectConnection(this.roadIdx, 0);
        this.addDirectConnection(this.roadIdx, this.roadDirections.length - 1);
        this.isCircular = true;
      }
    }

    return this;
  }

  public addDirectConnection(toRoadIdx: number, atRoadPosIdx: number): void {
    while (this.connections.length <= toRoadIdx) {
      this.connections.push([]);
    }
    if (this.connections[toRoadIdx].indexOf(atRoadPosIdx) === -1) {
      this.connections[toRoadIdx].push(atRoadPosIdx);
    }
  }

  public addIndirectConnection(toRoadIdx: number, viaRoadIdx: number, distance: number): void {
    while (this.indirectConnections.length <= toRoadIdx) {
      this.indirectConnections.push([]);
    }

    if (this.indirectConnections[toRoadIdx].findIndex(indirectConnection => indirectConnection[0] === toRoadIdx) === -1) {
      this.indirectConnections[toRoadIdx].push([viaRoadIdx, distance]);
    }
  }

  public getConnection(curPos: RoadPos, destRoadIdx: number): RoadConnectionEntry {
    if (this.hasDirectConnection(destRoadIdx)) {
      return this.getDirectConnection(curPos, destRoadIdx);
    } else {
      return this.getIndirectConnection(curPos, destRoadIdx);
    }
  }

  public getConnectionDestRoadPosIdx(destRoadIdx: number, destRoadConnectionIdx: number): number {
    // console.log(this.roadIdx, destRoadIdx, destRoadConnectionIdx, this.connections);
    return this.connections[destRoadIdx][destRoadConnectionIdx];
  }

  public shouldMoveUpThePath(curPos: RoadPos, destRoadPosIdx: number): boolean {
    let moveUpThPath = curPos[1] < destRoadPosIdx;
    if (this.isCircular && Math.abs(curPos[1] - destRoadPosIdx) > (this.roadDirections.length / 2)) {
      moveUpThPath = !moveUpThPath;
    }
    return moveUpThPath;
  }

  public getMoveDirection(curPos: RoadPos, destRoadPosIdx: number): DirectionConstant {
    const direction = this.shouldMoveUpThePath(curPos, destRoadPosIdx) ? 0 : 1;
    curPos[1] = (curPos[1] === 0 && direction === 1) ? (this.roadDirections.length - 1) :
      (curPos[1] === this.roadDirections.length - 1 && direction === 0) ? 0 : curPos[1];
    // console.log("getMoveDirection", `${curPos[1]} => ${destRoadPosIdx}`, direction, this.roadDirections[curPos[1]]);
    return this.roadDirections[curPos[1]][direction] as DirectionConstant;
  }

  public updatePos(pos: RoadPos, destRoadPosIdx: number): void {
    pos[1] += this.shouldMoveUpThePath(pos, destRoadPosIdx) ? 1 : -1;
  }

  private hasDirectConnection(destRoadIdx: number): boolean {
    return !!this.connections[destRoadIdx]?.length;
  }

  private getDirectConnection(curPos: RoadPos, destRoadIdx: number): RoadConnectionEntry {
    const [destRoadPosIdx, connectionIdx] = findInArray(this.connections[destRoadIdx],
      roadPosIdx => Math.abs(curPos[1] - roadPosIdx));
    if (destRoadPosIdx === null) return null;

    // console.log("getDirectConnection", curPos, destRoadIdx, destRoadPosIdx, connectionIdx)

    return [destRoadPosIdx, destRoadIdx, connectionIdx];
  }

  private getIndirectConnection(curPos: RoadPos, destRoadIdx: number): RoadConnectionEntry {
    const [roadIndirectConnection] =
      findInArray(this.indirectConnections[destRoadIdx], indirectConnection => indirectConnection[1]);
    if (!roadIndirectConnection) return null;

    return this.getDirectConnection(curPos, roadIndirectConnection[0]);
  }
}
