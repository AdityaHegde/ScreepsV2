import {GameMocksTestBase} from "../../utils/GameMocksTestBase";
import {PositionsEntity} from "@utils/rearrangePositions";
import {ArrayPos} from "../../../src/preprocessing/Prefab";
import should from "should";
import {DataProviderData} from "../../utils/TestBase";
import {initPositionsEntry} from "@utils/initPositionsEntry";

type PositionsData = [roadEndArrayPos: ArrayPos, entityPos: RoomPosition, expected: PositionsEntity];

@GameMocksTestBase.Suite
export class InitPositionsEntryTest extends GameMocksTestBase {
  public initPositionsData(): DataProviderData<PositionsData> {
    return {
      subData: [
        InitPositionsEntryTest.getInitPositionsDataForAdjacentPos(),
        InitPositionsEntryTest.getInitPositionsDataForFarPos(),
      ],
    };
  }

  @GameMocksTestBase.Test("initPositionsData")
  public shouldInitPositions(
    roadEndArrayPos: ArrayPos, entityPos: RoomPosition,
    expected: PositionsEntity,
  ): void {
    const original: PositionsEntity = {
      positions: [], positionAssignments: [], middleIdx: -1, roadPos: null,
    };
    initPositionsEntry(original, new Room.Terrain(""), roadEndArrayPos, entityPos);
    should(original).be.eql(expected);
  }

  private static getInitPositionsDataForAdjacentPos(): DataProviderData<PositionsData> {
    return {
      title: "Entity is Adjacent",
      subData: [{
        args: [
          [2, 2], new RoomPosition(1, 1, ""),
          {positions: [[2, 1], [2, 2], [1, 2]], positionAssignments: ["", "", ""], middleIdx: 1, roadPos: null},
        ],
      }, {
        args: [
          [2, 2], new RoomPosition(1, 2, ""),
          {positions: [[2, 1], [2, 2], [2, 3]], positionAssignments: ["", "", ""], middleIdx: 1, roadPos: null},
        ],
      }, {
        args: [
          [2, 2], new RoomPosition(3, 3, ""),
          {positions: [[2, 3], [2, 2], [3, 2]], positionAssignments: ["", "", ""], middleIdx: 1, roadPos: null},
        ],
      }, {
        args: [
          [2, 2], new RoomPosition(2, 3, ""),
          {positions: [[1, 2], [2, 2], [3, 2]], positionAssignments: ["", "", ""], middleIdx: 1, roadPos: null},
        ],
      }],
    }
  }

  private static getInitPositionsDataForFarPos(): DataProviderData<PositionsData> {
    return {
      title: "Entity is Far",
      subData: [
        ...[[1, 1, ""], [2, 3], [3, 2]].map((entityPos: ArrayPos) => {
          return {
            args: [
              [5, 5], new RoomPosition(entityPos[0], entityPos[1], ""),
              {positions: [[5, 4], [5, 5], [4, 5]], positionAssignments: ["", "", ""], middleIdx: 1, roadPos: null},
            ],
          } as DataProviderData<PositionsData>;
        }),
        ...[[10, 10, ""], [6, 7], [7, 6]].map((entityPos: ArrayPos) => {
          return {
            args: [
              [5, 5], new RoomPosition(entityPos[0], entityPos[1], ""),
              {positions: [[5, 6], [5, 5], [6, 5]], positionAssignments: ["", "", ""], middleIdx: 1, roadPos: null},
            ],
          } as DataProviderData<PositionsData>;
        }),
        ...[[10, 5, ""], [7, 5]].map((entityPos: ArrayPos) => {
          return {
            args: [
              [5, 5], new RoomPosition(entityPos[0], entityPos[1], ""),
              {positions: [[5, 6], [5, 5], [5, 4]], positionAssignments: ["", "", ""], middleIdx: 1, roadPos: null},
            ],
          } as DataProviderData<PositionsData>;
        }),
      ],
    };
  }
}
