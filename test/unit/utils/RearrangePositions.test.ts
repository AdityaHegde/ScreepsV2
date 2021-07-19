import {DataProviderData} from "../../utils/TestBase";
import {PositionsEntity, rearrangePositions} from "../../../src/utils/rearrangePositions";
import should from "should";
import {CreepWrapper} from "../../../src/wrappers/CreepWrapper";
import {GameMocksTestBase} from "../../utils/GameMocksTestBase";
import {PositionsEntityWrapper} from "@wrappers/PositionsEntityWrapper";

type RearrangePositionsData = [
  original: PositionsEntity, creeps: Array<string>,
  newCreep: string, expected: PositionsEntity,
];

@GameMocksTestBase.Suite
export class RearrangePositionsTest extends GameMocksTestBase {
  public rearrangePositionsData(): DataProviderData<RearrangePositionsData> {

    return {
      subData: [
        RearrangePositionsTest.getDataForCenteredPositions(),
        RearrangePositionsTest.getDataForCenteredPositionsWithNewCreeps(),
        RearrangePositionsTest.getDataForOffCenterToLeftPositions(),
        RearrangePositionsTest.getDataForOffCenterToLeftPositionsWithNewCreeps(),
        RearrangePositionsTest.getDataForOffCenterToRightPositions(),
        RearrangePositionsTest.getDataForOffCenterToRightPositionsWithNewCreeps(),
      ],
    };
  }

  @GameMocksTestBase.Test("rearrangePositionsData")
  public shouldRearrangePositions(
    original: PositionsEntity, creepNames: Array<string>,
    newCreep: string, expected: PositionsEntity,
  ): void {
    const positionEntityWrapper = new PositionsEntityWrapper("");
    Object.keys(original).forEach(key => positionEntityWrapper[key] = original[key]);
    creepNames.forEach(creepName => this.gameMocks.getCreep(creepName, new RoomPosition(0, 0, "r")));
    rearrangePositions(original, newCreep ? CreepWrapper.getEntityWrapper(newCreep) : null);
    should(original).be.eql(expected);
  }

  private static getDataForCenteredPositions(): DataProviderData<RearrangePositionsData> {
    const centeredPositions: PositionsEntity = {
      positions: [[2, 1], [2, 2], [2, 3], [2, 4], [2, 5]],
      positionAssignments: [],
      middleIdx: 2, roadPos: null,
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
    const centeredPositions: PositionsEntity = {
      positions: [[2, 1], [2, 2], [2, 3], [2, 4], [2, 5]],
      positionAssignments: [],
      middleIdx: 2, roadPos: null,
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
    const offCenterToLeftPositions: PositionsEntity = {
      positions: [[2, 1], [2, 2], [2, 3], [2, 4], [2, 5]],
      positionAssignments: [],
      middleIdx: 0, roadPos: null,
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
    const offCenterToLeftPositions: PositionsEntity = {
      positions: [[2, 1], [2, 2], [2, 3], [2, 4], [2, 5]],
      positionAssignments: [],
      middleIdx: 0, roadPos: null,
    };
    return {
      title: "Off Centered To Left Positions",
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
    const offCenterToRightPositions: PositionsEntity = {
      positions: [[2, 1], [2, 2], [2, 3], [2, 4], [2, 5]],
      positionAssignments: [],
      middleIdx: 4, roadPos: null,
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
    const offCenterToRightPositions: PositionsEntity = {
      positions: [[2, 1], [2, 2], [2, 3], [2, 4], [2, 5]],
      positionAssignments: [],
      middleIdx: 4, roadPos: null,
    };
    return {
      title: "Off Centered To Right Positions",
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
