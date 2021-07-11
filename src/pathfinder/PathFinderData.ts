import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {ArrayPos, RoadPos} from "../preprocessing/Prefab";
import {Road} from "./Road";
import {ColonyBaseClass} from "../ColonyBaseClass";
import {RoadIntersections} from "@pathfinder/RoadIntersections";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {getKeyFromArrayPos} from "@pathfinder/PathUtils";
import {findInArray} from "@utils/StatsUtils";
import {CreepWrapper} from "@wrappers/CreepWrapper";

@MemoryClass("pathFinder")
export class PathFinderData extends ColonyBaseClass {
  /**
   * Map from different x/y that are adjacent to RoadPos
   */
  @inMemory(() => {return {}})
  public posToRoadMap: Record<string, Array<RoadPos>>;

  /**
   * Map from different x/y to RoadPos
   */
  @inMemory(() => {return {}})
  public roadPosMap: Record<string, Array<RoadPos>>;

  @inMemory(() => {return {}})
  public creepsInRoad: Record<string, string>;
  @inMemory(() => [])
  public movedCreepWrapperIds: Array<string>;

  @inMemory(() => [])
  public roadIds: Array<string>;
  public roads: Array<Road>;

  public queuedCreepWrappers: Array<CreepWrapper>;
  public moveTargetPoints: Record<string, Array<CreepWrapper>>;
  public moveConflictPoints: Set<string>;

  public constructor(id: string, room: Room) {
    super(id, room);
    this.roads = this.roadIds.map((roadId, roadIdx) => new Road(roadId, roadIdx));
  }

  public preTick(): void {
    this.movedCreepWrapperIds = [];
    this.queuedCreepWrappers = [];
    this.moveTargetPoints = {};
    this.moveConflictPoints = new Set();
  }

  public addRoadFromRawRoad(rawRoad: Array<ArrayPos>, roadIntersectionsMap: Map<number, RoadIntersections>, startIndex: number): Road {
    const road = new Road(getIdFromRoom(this.room, `${this.roadIds.length}`),
      this.roadIds.length).addArrayOfPos(rawRoad);
    this.roads.push(road);
    this.roadIds.push(road.id);
    rawRoad.forEach((rawRoadPos, roadPosIdx) => this.addRawRoadPos(rawRoadPos, road.roadIdx, roadPosIdx));
    // if the road is circular but 1st and last positions do not overlap
    if (road.isCircular && rawRoad.length < road.roadDirections.length) {
      this.addRawRoadPos(rawRoad[0], road.roadIdx, road.roadDirections.length - 1);
      roadIntersectionsMap.forEach((roadIntersections) => {
        if (roadIntersections.intersections[0].sourceRoadPathIdx === 0) {
          roadIntersections.intersections.push({
            sourceRoadPathIdx: road.roadDirections.length - 1,
            targetRoadPathIdx: roadIntersections.intersections[0].targetRoadPathIdx,
          });
        }
      });
    }

    this.addRoadConnections(road, roadIntersectionsMap, startIndex);

    return road;
  }

  private addRawRoadPos(rawRoadPos: ArrayPos, roadIdx: number, roadPosIdx: number): void {
    const roadKey = getKeyFromArrayPos(rawRoadPos);
    this.roadPosMap[roadKey] ??= [];
    this.roadPosMap[roadKey].push([roadIdx, roadPosIdx]);
  }

  private addRoadConnections(road: Road, roadIntersectionsMap: Map<number, RoadIntersections>, startIndex: number) {
    roadIntersectionsMap.forEach((roadIntersections, roadIdx) => {
      roadIntersections.intersections.forEach(roadIntersection =>
        this.addInterconnection(road.roadIdx, roadIntersection.sourceRoadPathIdx - startIndex, roadIdx, roadIntersection.targetRoadPathIdx));
    });

    const reverseIndirectConnections = new Array<number>();

    for (let roadIdx = 0; roadIdx < this.roads.length - 1; roadIdx++) {
      if (!roadIntersectionsMap.get(roadIdx)?.intersections.length) {
        this.addIndirectConnection(road, roadIdx);
        reverseIndirectConnections.push(roadIdx);
        // this.addIndirectConnection(this.roads[roadIdx], road.roadIdx);
      } else {
        // if new direction connections are formed between disjoint paths, join them through the new road
        // this will handle islands
        for (let nextRoadIdx = roadIdx + 1; nextRoadIdx < this.roads.length - 1; nextRoadIdx++) {
          if (!roadIntersectionsMap.get(nextRoadIdx)?.intersections.length ||
              this.roads[roadIdx].connections[nextRoadIdx]?.length) continue;
          this.updateIndirectConnection(road, roadIdx, nextRoadIdx);
        }
      }
    }

    reverseIndirectConnections.forEach(reverseIndirectConnection =>
      this.addIndirectConnection(this.roads[reverseIndirectConnection], road.roadIdx));
  }

  private addInterconnection(roadIdx1: number, roadPosIdx1: number, roadIdx2: number, roadPosIdx2: number) {
    this.roads[roadIdx1].addDirectConnection(roadIdx2, roadPosIdx1);
    this.roads[roadIdx2].addDirectConnection(roadIdx1, roadPosIdx2);
  }

  private updateIndirectConnection(connectingRoad: Road, roadIdx1: number, roadIdx2: number): void {
    // TODO: update indirect connections from farther paths
    const road1 = this.roads[roadIdx1];
    const road2 = this.roads[roadIdx2];

    if (!road1.indirectConnections[roadIdx2]?.length || road1.indirectConnections[roadIdx2][0][1] === 1) {
      road1.addIndirectConnection(roadIdx2, connectingRoad.roadIdx, 1);
    }
    if (!road2.indirectConnections[roadIdx1]?.length || road2.indirectConnections[roadIdx1][0][1] === 1) {
      road2.addIndirectConnection(roadIdx1, connectingRoad.roadIdx, 1);
    }
  }

  private addIndirectConnection(road: Road, toRoadIdx: number): void {
    const toRoad = this.roads[toRoadIdx];

    let minRoadIdxs = new Array<number>();
    let minDist = Number.MAX_SAFE_INTEGER;

    road.connections.forEach((roadConnections, viaRoadIdx) => {
      if (!roadConnections.length || toRoadIdx === viaRoadIdx || road.roadIdx === viaRoadIdx) return;
      let curRoadIdx = -1;
      let curMinDist = Number.MAX_SAFE_INTEGER;

      // if there is direct connection via road to target road
      if (toRoad.connections[viaRoadIdx]?.length) {
        curRoadIdx = viaRoadIdx;
        // TODO: get a better distance
        curMinDist = 1;
      } else if (toRoad.indirectConnections[viaRoadIdx]?.length) {
        // else find through indirection connection in via road
        const [, , indirectDist] = findInArray(toRoad.indirectConnections[viaRoadIdx],
          indirectConnection => indirectConnection[1] + 1);
        curMinDist = indirectDist;
        curRoadIdx = viaRoadIdx;
      }

      // console.log(`${road.roadIdx} => ${toRoadIdx}`, viaRoadIdx, `${curMinDist} <= ${minDist} ?`);

      if (curMinDist === minDist) {
        // if min dist is same, add to the list of roads
        minRoadIdxs.push(curRoadIdx);
      } else if (curMinDist < minDist) {
        // else if dist is less than min dist
        minRoadIdxs = [curRoadIdx];
        minDist = curMinDist;
      }
    });

    if (minDist < Number.MAX_SAFE_INTEGER) {
      // console.log(`Adding ${road.roadIdx} => ${toRoadIdx}, ${JSON.stringify(minRoadIdxs)}`);
      minRoadIdxs.forEach((minRoadIdx) => {
        road.addIndirectConnection(toRoadIdx, minRoadIdx, minDist);
      });
    }
  }
}
