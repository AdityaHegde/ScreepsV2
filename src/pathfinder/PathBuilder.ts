import {ArrayPos, RoadPos} from "../preprocessing/Prefab";
import {DIRECTION_OFFSETS, getKeyFromArrayPos, getKeyFromArrayXY} from "./PathUtils";
import {Road} from "./Road";
import {getIdFromRoom} from "../utils/getIdFromRoom";
import {RoadIntersections} from "./RoadIntersections";
import {PathFinderData} from "./PathFinderData";
import {findInArray, getAverage} from "../utils/StatsUtils";

export class PathBuilder {
  public readonly pathFinderData: PathFinderData;

  public constructor(colonyPathFinder: PathFinderData) {
    this.pathFinderData = colonyPathFinder;
  }

  public addRoad(arrayOfPos: Array<ArrayPos>): RoadPos {
    let lastStartIdx = 0;
    let lastDuplicateRoadIdx = -1;
    const roadIntersectionsMap = new Map<number, RoadIntersections>();

    // TODO: simplify this
    arrayOfPos.forEach((arrayPos, index) => {
      const key = getKeyFromArrayPos(arrayPos);
      if (key in this.pathFinderData.roadPosMap) {
        const roadIdxInCurPos = new Set<number>();

        this.pathFinderData.roadPosMap[key].forEach((roadPos) => {
          let roadIntersections: RoadIntersections;
          if (!roadIntersectionsMap.has(roadPos[0])) {
            roadIntersections = { count: 0, startIdx: -1, intersections: [] };
            roadIntersectionsMap.set(roadPos[0], roadIntersections);
          } else {
            roadIntersections = roadIntersectionsMap.get(roadPos[0]);
          }

          roadIntersections.count++;
          roadIntersections.intersections.push({
            sourceRoadPathIdx: index,
            targetRoadPathIdx: roadPos[1],
          });
          if (roadIntersections.count === 1) {
            roadIntersections.startIdx = index;
          }

          roadIdxInCurPos.add(roadPos[0]);
        });

        roadIntersectionsMap.forEach((roadIntersections, roadIdx) => {
          if (!roadIdxInCurPos.has(roadIdx)) {
            roadIntersections.count = 0;
          } else if (roadIntersections.count > 1) {
            lastDuplicateRoadIdx = roadIdx;
            const lastIntersection = roadIntersections.intersections[roadIntersections.intersections.length - 1];
            if (roadIntersections.startIdx !== lastStartIdx) {
              roadIntersections.intersections = roadIntersections.intersections.slice(0, roadIntersections.intersections.length - 1);
              this.addRoadFromRawRoad(arrayOfPos.slice(lastStartIdx, roadIntersections.startIdx + 1), roadIntersectionsMap, lastStartIdx);
              lastStartIdx = roadIntersections.startIdx;
              this.clearRoadIntersectionsMap(roadIntersectionsMap);
            }
            roadIntersections.intersections = [lastIntersection];
          }
        });
      } else if (roadIntersectionsMap.size > 0) {
        roadIntersectionsMap.forEach(roadTillNow => roadTillNow.count = 0);
        if (lastDuplicateRoadIdx >= 0) {
          lastStartIdx = index - 1;
          lastDuplicateRoadIdx = -1;
        }
      }
    });

    let hasRoad = false;
    roadIntersectionsMap.forEach((value) => {
      hasRoad ||= value.count > 1;
    });
    let lastRoad = this.pathFinderData.roads[this.pathFinderData.roads.length - 1];
    if (!hasRoad) {
      lastRoad = this.addRoadFromRawRoad(arrayOfPos.slice(lastStartIdx), roadIntersectionsMap, lastStartIdx);
    }

    return [lastRoad.roadIdx, lastRoad.roadDirections.length - 1];
  }

  private addRoadFromRawRoad(rawRoad: Array<ArrayPos>, roadIntersectionsMap: Map<number, RoadIntersections>, startIndex: number): Road {
    const road = new Road(getIdFromRoom(this.pathFinderData.room, `${this.pathFinderData.roadIds.length}`),
      this.pathFinderData.roadIds.length).addArrayOfPos(rawRoad);
    this.pathFinderData.roads.push(road);
    this.pathFinderData.roadIds.push(road.id);
    rawRoad.forEach((rawRoadPos, roadPosIdx) => this.addRawRoadPos(rawRoadPos, road.roadIdx, roadPosIdx));

    this.addRoadConnections(road, roadIntersectionsMap, startIndex);

    return road;
  }

  private addRawRoadPos(rawRoadPos: ArrayPos, roadIdx: number, roadPosIdx: number): void {
    // DIRECTION_OFFSETS.forEach((directionOffset) => {
    //   const key = getKeyFromArrayXY(rawRoadPos[0]+directionOffset[0], rawRoadPos[1]+directionOffset[1]);
    //   if (!(key in this.pathFinderData.roadPosMap)) {
    //     this.pathFinderData.posToRoadMap[key] ??= [];
    //     this.pathFinderData.posToRoadMap[key].push([roadIdx, roadPosIdx]);
    //   }
    // });
    const roadKey = getKeyFromArrayPos(rawRoadPos);
    this.pathFinderData.roadPosMap[roadKey] ??= [];
    this.pathFinderData.roadPosMap[roadKey].push([roadIdx, roadPosIdx]);
    // delete this.pathFinderData.posToRoadMap[roadKey];
  }

  private addRoadConnections(road: Road, roadIntersectionsMap: Map<number, RoadIntersections>, startIndex: number) {
    roadIntersectionsMap.forEach((roadIntersections, roadIdx) => {
      roadIntersections.intersections.forEach(roadIntersection =>
        this.addInterconnection(road.roadIdx, roadIntersection.sourceRoadPathIdx - startIndex, roadIdx, roadIntersection.targetRoadPathIdx));
    });

    for (let roadIdx = 0; roadIdx < this.pathFinderData.roads.length - 1; roadIdx++) {
      if (roadIntersectionsMap.has(roadIdx)) continue;
      this.addIndirectConnection(road, roadIdx);
    }
  }

  private addInterconnection(roadIdx1: number, roadPosIdx1: number, roadIdx2: number, roadPosIdx2: number) {
    this.pathFinderData.roads[roadIdx1].addDirectConnection(roadIdx2, roadPosIdx1);
    this.pathFinderData.roads[roadIdx2].addDirectConnection(roadIdx1, roadPosIdx2);
  }

  private addIndirectConnection(road: Road, toRoadIdx: number): void {
    const [, minRoadIdx, minDist] = findInArray(road.connections, (roadConnections, roadIdx) => {
      if (roadConnections.length === 0) return Number.MAX_SAFE_INTEGER;

      const viaRoad = this.pathFinderData.roads[roadIdx];
      if (!viaRoad.connections[toRoadIdx]?.length) return Number.MAX_SAFE_INTEGER;

      // TODO: do a better avg dist
      return Math.abs(getAverage(viaRoad.connections[road.roadIdx]) - getAverage(viaRoad.connections[toRoadIdx]));
    });

    if (minDist >= 0) {
      road.addIndirectConnection(toRoadIdx, minRoadIdx, minDist);
      this.pathFinderData.roads[toRoadIdx].addIndirectConnection(road.roadIdx, minRoadIdx, minDist);
    }
  }

  private clearRoadIntersectionsMap(roadIntersectionsMap: Map<number, RoadIntersections>) {
    roadIntersectionsMap.forEach((roadIntersections) => {
      if (roadIntersections.count > 1) {
        roadIntersections.intersections = [roadIntersections.intersections[roadIntersections.intersections.length - 1]];
      } else {
        roadIntersections.intersections = [];
      }
    });
  }
}
