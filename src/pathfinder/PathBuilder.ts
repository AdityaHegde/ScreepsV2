import {ArrayPos} from "../preprocessing/Prefab";
import {getKeyFromArrayPos} from "./PathUtils";
import {RoadIntersections} from "./RoadIntersections";
import {PathFinderData} from "./PathFinderData";
import {RoadPos} from "@pathfinder/RoadTypes";

export class PathBuilder {
  public readonly pathFinderData: PathFinderData;

  public constructor(colonyPathFinder: PathFinderData) {
    this.pathFinderData = colonyPathFinder;
  }

  public addRoad(arrayOfPos: Array<ArrayPos>): RoadPos {
    let lastStartIdx = -1;
    const roadIntersectionsMap = new Map<number, RoadIntersections>();

    arrayOfPos.forEach((arrayPos, index) => {
      const key = getKeyFromArrayPos(arrayPos);
      const nextKey = (index < arrayOfPos.length - 1) ? getKeyFromArrayPos(arrayOfPos[index + 1]) : null;
      if (key in this.pathFinderData.roadPosMap) {
        const roadIdxInCurPos = new Set<number>();

        this.updateRoadIntersectionsMap(this.pathFinderData.roadPosMap[key], roadIntersectionsMap, index, roadIdxInCurPos);

        // lock ahead to see if there an overlap in road
        if (nextKey && (nextKey in this.pathFinderData.roadPosMap)) {
          for (const roadPos of this.pathFinderData.roadPosMap[nextKey]) {
            if (roadIntersectionsMap.has(roadPos[0])) {
              if (roadIntersectionsMap.get(roadPos[0]).count === 1 && lastStartIdx >= 0) {
                this.pathFinderData.addRoadFromRawRoad(arrayOfPos.slice(lastStartIdx, index + 1), roadIntersectionsMap, lastStartIdx);
                lastStartIdx = -1;
                break;
              }
            }
          }
        }

        let shouldClearMap = false;
        roadIntersectionsMap.forEach((roadIntersections, roadIdx) => {
          if (!roadIdxInCurPos.has(roadIdx)) {
            roadIntersections.count = 0;
          } else if (roadIntersections.count > 1) {
            shouldClearMap = true;
          }
        });
        if (shouldClearMap) this.clearRoadIntersectionsMap(roadIntersectionsMap);
      } else {
        if (roadIntersectionsMap.size > 0) {
          roadIntersectionsMap.forEach(roadTillNow => roadTillNow.count = 0);
        }
        if (lastStartIdx === -1) {
          lastStartIdx = Math.max(index - 1, 0);
        }
      }
    });

    let hasRoad = false;
    roadIntersectionsMap.forEach((value) => {
      hasRoad ||= value.count > 1;
    });
    let lastRoad = this.pathFinderData.roads[this.pathFinderData.roads.length - 1];
    if (!hasRoad && lastStartIdx >= 0) {
      lastRoad = this.pathFinderData.addRoadFromRawRoad(arrayOfPos.slice(lastStartIdx), roadIntersectionsMap, lastStartIdx);
    }

    if (!lastRoad) return null;

    return [lastRoad.roadIdx, lastRoad.roadDirections.length - 1];
  }

  private updateRoadIntersectionsMap(
    roadPosArray: Array<RoadPos>,
    roadIntersectionsMap: Map<number, RoadIntersections>, index: number,
    roadIdxInCurPos: Set<number>,
  ) {
    roadPosArray.forEach((roadPos) => {
      let roadIntersections: RoadIntersections;
      if (!roadIntersectionsMap.has(roadPos[0])) {
        roadIntersections = { count: 0, startIdx: -1, intersections: [] };
        roadIntersectionsMap.set(roadPos[0], roadIntersections);
      } else {
        roadIntersections = roadIntersectionsMap.get(roadPos[0]);
      }

      if (!roadIdxInCurPos.has(roadPos[0])) {
        roadIntersections.count++;
      }
      roadIntersections.intersections.push({
        sourceRoadPathIdx: index,
        targetRoadPathIdx: roadPos[1],
      });
      if (roadIntersections.count === 1) {
        roadIntersections.startIdx = index;
      }

      roadIdxInCurPos.add(roadPos[0]);
    });
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
