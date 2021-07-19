import {GameMocksTestBase} from "../../utils/GameMocksTestBase";
import {PositionsEntity} from "@utils/rearrangePositions";
import {ArrayPos} from "../../../src/preprocessing/Prefab";
import should from "should";
import {DataProviderData} from "../../utils/TestBase";
import {initPositionsEntry} from "@utils/initPositionsEntry";
import {PositionsEntityWrapper} from "@wrappers/PositionsEntityWrapper";

type PositionsData = [roadEndArrayPos: ArrayPos, entityPos: RoomPosition, expected: any];

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
    this.gameMocks.getStructure("struct", entityPos, {structureType: "controller"}).room = new Room("r");
    const positionsEntityWrapper = new PositionsEntityWrapper("struct");
    positionsEntityWrapper.init([0, 0], roadEndArrayPos, [0, 0]);
    should({
      positions: positionsEntityWrapper.positions,
      positionAssignments: positionsEntityWrapper.positionAssignments,
      middleIdx: positionsEntityWrapper.middleIdx,
    }).be.eql(expected);
  }

  private static getInitPositionsDataForAdjacentPos(): DataProviderData<PositionsData> {
    return {
      title: "Entity is Adjacent",
      subData: [{
        args: [
          [2, 2], new RoomPosition(1, 1, ""),
          {positions: [[2, 1], [2, 2], [1, 2]], positionAssignments: ["", "", ""], middleIdx: 1},
        ],
      }, {
        args: [
          [2, 2], new RoomPosition(1, 2, ""),
          {positions: [[2, 1], [2, 2], [2, 3]], positionAssignments: ["", "", ""], middleIdx: 1},
        ],
      }, {
        args: [
          [2, 2], new RoomPosition(3, 3, ""),
          {positions: [[2, 3], [2, 2], [3, 2]], positionAssignments: ["", "", ""], middleIdx: 1},
        ],
      }, {
        args: [
          [2, 2], new RoomPosition(2, 3, ""),
          {positions: [[1, 2], [2, 2], [3, 2]], positionAssignments: ["", "", ""], middleIdx: 1},
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
              {positions: [[5, 4], [5, 5], [4, 5]], positionAssignments: ["", "", ""], middleIdx: 1},
            ],
          } as DataProviderData<PositionsData>;
        }),
        ...[[10, 10, ""], [6, 7], [7, 6]].map((entityPos: ArrayPos) => {
          return {
            args: [
              [5, 5], new RoomPosition(entityPos[0], entityPos[1], ""),
              {positions: [[5, 6], [5, 5], [6, 5]], positionAssignments: ["", "", ""], middleIdx: 1},
            ],
          } as DataProviderData<PositionsData>;
        }),
        ...[[10, 5, ""], [7, 5]].map((entityPos: ArrayPos) => {
          return {
            args: [
              [5, 5], new RoomPosition(entityPos[0], entityPos[1], ""),
              {positions: [[5, 6], [5, 5], [5, 4]], positionAssignments: ["", "", ""], middleIdx: 1},
            ],
          } as DataProviderData<PositionsData>;
        }),
      ],
    };
  }
}
