import {GameMocksTestBase} from "@test-utils/GameMocksTestBase";
import {ArrayPos} from "../../../src/preprocessing/Prefab";
import {DataProviderData} from "@test-utils/TestBase";
import {PositionsEntityWrapper} from "@wrappers/positions/PositionsEntityWrapper";
import should from "should";
import {PositionsEntity, rearrangePositions} from "@utils/rearrangePositions";
import {CreepWrapper} from "@wrappers/CreepWrapper";

interface PositionsEntityData {
  positions: Array<ArrayPos>;
  positionAssignments: Array<string>;
  middleIdx: number;
}
type PositionsData = [roadEndArrayPos: ArrayPos, entityPos: RoomPosition, expected: PositionsEntityData];
type RearrangePositionsData = [
  original: PositionsEntityData, creeps: Array<string>,
  newCreep: string, expected: PositionsEntityData,
];

@GameMocksTestBase.Suite
export class PositionsEntityWrapperTest extends GameMocksTestBase {
  public initPositionsData(): DataProviderData<PositionsData> {
    return {
      subData: [
        PositionsEntityWrapperTest.getInitPositionsDataForAdjacentPos(),
        PositionsEntityWrapperTest.getInitPositionsDataForFarPos(),
      ],
    };
  }

  @GameMocksTestBase.Test("initPositionsData")
  public shouldInitPositions(
    roadEndArrayPos: ArrayPos, entityPos: RoomPosition,
    expected: PositionsEntityData,
  ): void {
    this.gameMocks.getStructure("struct", entityPos, {structureType: "controller"}).room = new Room("r");
    const positionsEntityWrapper = new PositionsEntityWrapper("struct", null, null);
    positionsEntityWrapper.init(roadEndArrayPos, roadEndArrayPos);
    should({
      positions: positionsEntityWrapper.positions,
      positionAssignments: positionsEntityWrapper.positionAssignments,
      middleIdx: positionsEntityWrapper.middleIdx,
    }).be.eql(expected);
  }

  public rearrangePositionsData(): DataProviderData<RearrangePositionsData> {
    return {
      subData: [
        PositionsEntityWrapperTest.getDataForCenteredPositions(),
        PositionsEntityWrapperTest.getDataForCenteredPositionsWithNewCreeps(),
        PositionsEntityWrapperTest.getDataForOffCenterToLeftPositions(),
        PositionsEntityWrapperTest.getDataForOffCenterToLeftPositionsWithNewCreeps(),
        PositionsEntityWrapperTest.getDataForOffCenterToRightPositions(),
        PositionsEntityWrapperTest.getDataForOffCenterToRightPositionsWithNewCreeps(),
      ],
    };
  }

  @GameMocksTestBase.Test("rearrangePositionsData")
  public shouldRearrangePositions(
    original: PositionsEntity, creepNames: Array<string>,
    newCreep: string, expected: PositionsEntity,
  ): void {
    const positionEntityWrapper = new PositionsEntityWrapper("", null, null);
    Object.keys(original).forEach(key => positionEntityWrapper[key] = original[key]);
    creepNames.forEach(creepName => this.gameMocks.getCreep(creepName, new RoomPosition(0, 0, "r")));
    rearrangePositions(original, newCreep ? CreepWrapper.getEntityWrapper(newCreep) : null);
    should(original).be.eql(expected);
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

  private static getDataForCenteredPositions(): DataProviderData<RearrangePositionsData> {
    const centeredPositions: PositionsEntityData = {
      positions: [[2, 1], [2, 2], [2, 3], [2, 4], [2, 5]],
      positionAssignments: [],
      middleIdx: 2,
    };
    return {
      title: "Centered Positions",
      subData: [{
        args: [
          {...centeredPositions, positionAssignments: ["c2", "", "c1", "c3", ""]},
          ["c1", "c2", "c3"], "",
          {...centeredPositions, positionAssignments: ["", "c2", "c1", "c3", ""]},
        ],
      }, {
        args: [
          {...centeredPositions, positionAssignments: ["", "c3", "", "c1", "c2"]},
          ["c1", "c2", "c3"], "",
          {...centeredPositions, positionAssignments: ["", "c3", "c1", "c2", ""]},
        ],
      }, {
        args: [
          {...centeredPositions, positionAssignments: ["c4", "c3", "", "c1", "c2"]},
          ["c1", "c2", "c3", "c4"], "",
          {...centeredPositions, positionAssignments: ["c4", "c3", "c1", "c2", ""]},
        ],
      }],
    };
  }

  private static getDataForCenteredPositionsWithNewCreeps(): DataProviderData<RearrangePositionsData> {
    const centeredPositions: PositionsEntityData = {
      positions: [[2, 1], [2, 2], [2, 3], [2, 4], [2, 5]],
      positionAssignments: [],
      middleIdx: 2,
    };
    return {
      title: "Centered Positions With New Creeps",
      subData: [{
        args: [
          {...centeredPositions, positionAssignments: ["", "", "", "", ""]},
          ["c1", "c2", "c3"], "c1",
          {...centeredPositions, positionAssignments: ["", "", "c1", "", ""]},
        ],
      }, {
        args: [
          {...centeredPositions, positionAssignments: ["c3", "", "c1", "c2", ""]},
          ["c1", "c2", "c3", "c4"], "c4",
          {...centeredPositions, positionAssignments: ["", "c3", "c4", "c1", "c2"]},
        ],
      }, {
        args: [
          {...centeredPositions, positionAssignments: ["", "", "c1", "c2", "c3"]},
          ["c1", "c2", "c3", "c4"], "c4",
          {...centeredPositions, positionAssignments: ["", "c1", "c4", "c2", "c3"]},
        ],
      }, {
        args: [
          {...centeredPositions, positionAssignments: ["", "c3", "", "c1", "c2"]},
          ["c1", "c2", "c3", "c4"], "c4",
          {...centeredPositions, positionAssignments: ["", "c3", "c4", "c1", "c2"]},
        ],
      }, {
        args: [
          {...centeredPositions, positionAssignments: ["c1", "c2", "", "", "c3"]},
          ["c1", "c2", "c3", "c4"], "c4",
          {...centeredPositions, positionAssignments: ["c1", "c2", "c4", "c3", ""]},
        ],
      }, {
        args: [
          {...centeredPositions, positionAssignments: ["c1", "c2", "c4", "", "c3"]},
          ["c1", "c2", "c3", "c4", "c5"], "c5",
          {...centeredPositions, positionAssignments: ["c1", "c2", "c5", "c4", "c3"]},
        ],
      }],
    };
  }

  private static getDataForOffCenterToLeftPositions(): DataProviderData<RearrangePositionsData> {
    const offCenterToLeftPositions: PositionsEntityData = {
      positions: [[2, 1], [2, 2], [2, 3], [2, 4], [2, 5]],
      positionAssignments: [],
      middleIdx: 0,
    };
    return {
      title: "Off Centered To Left Positions",
      subData: [{
        args: [
          {...offCenterToLeftPositions, positionAssignments: ["c1", "", "c2", "c3", ""]},
          ["c1", "c2", "c3"], "",
          {...offCenterToLeftPositions, positionAssignments: ["c1", "c2", "c3", "", ""]},
        ],
      }, {
        args: [
          {...offCenterToLeftPositions, positionAssignments: ["", "c1", "", "c2", "c3"]},
          ["c1", "c2", "c3"], "",
          {...offCenterToLeftPositions, positionAssignments: ["c1", "", "c2", "c3", ""]},
        ],
      }, {
        args: [
          {...offCenterToLeftPositions, positionAssignments: ["", "c1", "c2", "c3", ""]},
          ["c1", "c2", "c3"], "",
          {...offCenterToLeftPositions, positionAssignments: ["c1", "c2", "c3", "", ""]},
        ],
      }, {
        args: [
          {...offCenterToLeftPositions, positionAssignments: ["", "c1", "c2", "", "c3"]},
          ["c1", "c2", "c3"], "",
          {...offCenterToLeftPositions, positionAssignments: ["c1", "c2", "", "c3", ""]},
        ],
      }],
    };
  }

  private static getDataForOffCenterToLeftPositionsWithNewCreeps(): DataProviderData<RearrangePositionsData> {
    const offCenterToLeftPositions: PositionsEntityData = {
      positions: [[2, 1], [2, 2], [2, 3], [2, 4], [2, 5]],
      positionAssignments: [],
      middleIdx: 0,
    };
    return {
      title: "Off Centered To Left Positions with new creeps",
      subData: [{
        args: [
          {...offCenterToLeftPositions, positionAssignments: ["", "", "", "", ""]},
          ["c1"], "c1",
          {...offCenterToLeftPositions, positionAssignments: ["c1", "", "", "", ""]},
        ],
      },{
        args: [
          {...offCenterToLeftPositions, positionAssignments: ["c1", "", "c2", "", "c3"]},
          ["c1", "c2", "c3", "c4"], "c4",
          {...offCenterToLeftPositions, positionAssignments: ["c4", "c1", "c2", "c3", ""]},
        ],
      }, {
        args: [
          {...offCenterToLeftPositions, positionAssignments: ["", "", "c1", "c2", ""]},
          ["c1", "c2", "c3", "c4"], "c4",
          {...offCenterToLeftPositions, positionAssignments: ["c4", "c1", "c2", "", ""]},
        ],
      }, {
        args: [
          {...offCenterToLeftPositions, positionAssignments: ["", "c1", "c2", "c3", "c4"]},
          ["c1", "c2", "c3", "c4", "c5"], "c5",
          {...offCenterToLeftPositions, positionAssignments: ["c5", "c1", "c2", "c3", "c4"]},
        ],
      }],
    }
  }

  private static getDataForOffCenterToRightPositions(): DataProviderData<RearrangePositionsData> {
    const offCenterToRightPositions: PositionsEntityData = {
      positions: [[2, 1], [2, 2], [2, 3], [2, 4], [2, 5]],
      positionAssignments: [],
      middleIdx: 4,
    };
    return {
      title: "Off Centered To Right Positions",
      subData: [{
        args: [
          {...offCenterToRightPositions, positionAssignments: ["", "c3", "c2", "", "c1"]},
          ["c1", "c2", "c3"], "",
          {...offCenterToRightPositions, positionAssignments: ["", "", "c3", "c2", "c1"]},
        ],
      }, {
        args: [
          {...offCenterToRightPositions, positionAssignments: ["c3", "c2", "", "c1", ""]},
          ["c1", "c2", "c3"], "",
          {...offCenterToRightPositions, positionAssignments: ["", "c3", "c2", "", "c1"]},
        ],
      }, {
        args: [
          {...offCenterToRightPositions, positionAssignments: ["", "c3", "c2", "c1", ""]},
          ["c1", "c2", "c3"], "",
          {...offCenterToRightPositions, positionAssignments: ["", "", "c3", "c2", "c1"]},
        ],
      }, {
        args: [
          {...offCenterToRightPositions, positionAssignments: ["c3", "", "c2", "c1", ""]},
          ["c1", "c2", "c3"], "",
          {...offCenterToRightPositions, positionAssignments: ["", "c3", "", "c2", "c1"]},
        ],
      }],
    };
  }

  private static getDataForOffCenterToRightPositionsWithNewCreeps(): DataProviderData<RearrangePositionsData> {
    const offCenterToRightPositions: PositionsEntityData = {
      positions: [[2, 1], [2, 2], [2, 3], [2, 4], [2, 5]],
      positionAssignments: [],
      middleIdx: 4,
    };
    return {
      title: "Off Centered To Right Positions new creeps",
      subData: [{
        args: [
          {...offCenterToRightPositions, positionAssignments: ["", "", "", "", ""]},
          ["c1"], "c1",
          {...offCenterToRightPositions, positionAssignments: ["", "", "", "", "c1"]},
        ],
      },{
        args: [
          {...offCenterToRightPositions, positionAssignments: ["c3", "", "c2", "", "c1"]},
          ["c1", "c2", "c3", "c4"], "c4",
          {...offCenterToRightPositions, positionAssignments: ["", "c3", "c2", "c1", "c4"]},
        ],
      }, {
        args: [
          {...offCenterToRightPositions, positionAssignments: ["", "c2", "c1", "", ""]},
          ["c1", "c2", "c3", "c4"], "c4",
          {...offCenterToRightPositions, positionAssignments: ["", "", "c2", "c1", "c4"]},
        ],
      }, {
        args: [
          {...offCenterToRightPositions, positionAssignments: ["c4", "c3", "c2", "c1", ""]},
          ["c1", "c2", "c3", "c4", "c5"], "c5",
          {...offCenterToRightPositions, positionAssignments: ["c4", "c3", "c2", "c1", "c5"]},
        ],
      }],
    }
  }
}
