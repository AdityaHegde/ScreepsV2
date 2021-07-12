import {DIRECTION_TO_OFFSET, getKeyFromArrayXY} from "@pathfinder/PathUtils";
import {ArrayPos} from "../../src/preprocessing/Prefab";
import _ from "lodash";
import {RoadPos} from "@pathfinder/RoadTypes";

export const MAX_X = 20;
export const MAX_Y = 20;

export function deserializePath(path: string): Array<ArrayPos> {
  path = path.replace(/(\d)x(\d)/g, (substring: string, dir: string, times: string) => {
    let retStr = "";
    for (let i = 0; i < Number(times); i++) {
      retStr += dir;
    }
    return retStr;
  });

  const result: Array<ArrayPos> = [[Number(path.substring(0, 2)), Number(path.substring(2, 4))]];

  for (let i = 4; i < path.length; i++) {
    const prevArrayPos = result[result.length - 1];
    const directionOffset = DIRECTION_TO_OFFSET[Number(path[i])] as ArrayPos;
    result.push([
      prevArrayPos[0] + directionOffset[0], prevArrayPos[1] + directionOffset[1],
    ]);
  }

  return result;
}

export function visualize(
  maxX: number, maxY: number,
  posToRoadMap: Record<string, Array<RoadPos>>,
  grid: Record<number, Record<number, string>> = {},
): void {
  for (let y = 0; y < maxX; y++) {
    let str = "";
    for (let x = 0; x < maxY; x++) {
      const key = getKeyFromArrayXY(x, y);
      const chars = (key in posToRoadMap) ? _.uniq(posToRoadMap[key].map(roadPos => roadPos[0])): " ";
      str += chars;
      str += grid[x]?.[y] ? `(${grid[x]?.[y]})` : "";
      for (let k = 0; k < 4 - chars.length; k++) {
        str += " ";
      }
    }
    console.log(str);
  }
}
