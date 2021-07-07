import {MemoryMockTestBase} from "../../utils/MemoryMockTestBase";
import {CreepMovementMocks} from "../../utils/CreepMovementMocks";
import {DataProviderData} from "../../utils/TestBase";
import {PathFinderData} from "@pathfinder/PathFinderData";
import {PathBuilder} from "@pathfinder/PathBuilder";
import {MOVE_COMPLETED, PathNavigator} from "@pathfinder/PathNavigator";
import {ArrayPos} from "../../../src/preprocessing/Prefab";
import {deserializePath, MAX_X, MAX_Y, visualize} from "../../utils/PathTestUtils";
import should from "should";

const MAX_TICKS = 20;

@MemoryMockTestBase.Suite
export class PathNavigatorTest extends MemoryMockTestBase {
  public roadMovementProvider(): DataProviderData<[
    paths: Array<string>, creepsPos: Array<ArrayPos>, targetsPos: Array<ArrayPos>, runForTicks: Array<number>,
  ]> {
    return {
      subData: [{
        args: [
          ["01014x83x54x7", "01092x44x42x4", "040624x42", "0407124x4221"],
          [ [1, 1], [2, 2], [3, 7] ],
          [ [5, 5], [2, 8], [11, 6] ],
          [ 4, 6, 9 ],
        ],
      }, {
        args: [
          ["05078822446", "070966882244", "09074466882", "070522446688"],
          [ [4, 6], [6, 4], [10, 6], [6, 8] ],
          [ [6, 6], [8, 4], [8, 8], [6, 10] ],
          [ 2, 2, 2, 2 ],
        ],
      }, {
        args: [
          [
            "05078822446", "070966882244", "09074466882", "070522446688",
            "06088x5", "08086x5", "08064x5", "06062x5",
          ],
          [ [7, 9], [12, 10], [10, 2] ],
          [ [1, 3], [2, 4], [12, 10] ],
          [ 6, 10, 8 ],
        ]
      }],
    };
  }

  @MemoryMockTestBase.Test("roadMovementProvider")
  public shouldMoveAFewCreeps(
    paths: Array<string>, creepsPos: Array<ArrayPos>, targetsPos: Array<ArrayPos>, runForTicks: Array<number>,
  ): void {
    const creepMovementMocks = new CreepMovementMocks(MAX_X, MAX_Y);
    const {pathFinderData, pathBuilder, pathNavigator} = this.getPathFinderInstances();
    paths.forEach(path => pathBuilder.addRoad(deserializePath(path)));

    const creeps = creepsPos.map((creepPos, idx) =>
      creepMovementMocks.createCreep(`C${idx}`, new RoomPosition(creepPos[0], creepPos[1], "r")));
    const targetRoomPositions = targetsPos.map(targetPos => new RoomPosition(targetPos[0], targetPos[1], "r"));

    const actualRunForTicks = creeps.map(() => 0);
    const reachedCreeps = new Set<string>();

    // visualize(MAX_X, MAX_Y, pathFinderData.roadPosMap, creepMovementMocks.grid);

    for (let i = 0; i < MAX_TICKS && reachedCreeps.size < creeps.length; i++) {
      console.log("Tick:", i);
      creeps.forEach((creep, idx) => {
        if (reachedCreeps.has(creep.name)) return;
        if (pathNavigator.resolveMove(creep) === MOVE_COMPLETED) {
          reachedCreeps.add(creep.name);
          return;
        }
        actualRunForTicks[idx]++;
        pathNavigator.move(creep, targetRoomPositions[idx]);
      });

      // if (reachedCreeps.size < creeps.length) {
      //   visualize(MAX_X, MAX_Y, pathFinderData.roadPosMap, creepMovementMocks.grid);
      // }
    }

    should(actualRunForTicks).be.eql(runForTicks);
  }

  private getPathFinderInstances() {
    const room = { name: "r" } as Room;
    const pathFinderData = new PathFinderData("path", room);
    const pathBuilder = new PathBuilder(pathFinderData);
    const pathNavigator = new PathNavigator(pathFinderData);
    return {pathFinderData, pathBuilder, pathNavigator};
  }
}
