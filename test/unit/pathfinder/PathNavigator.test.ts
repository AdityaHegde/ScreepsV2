import {MemoryMockTestBase} from "../../utils/MemoryMockTestBase";
import {CreepMovementMocks} from "../../utils/CreepMovementMocks";
import {DataProviderData} from "../../utils/TestBase";
import {PathFinderData} from "../../../src/pathfinder/PathFinderData";
import {PathBuilder} from "../../../src/pathfinder/PathBuilder";
import {MOVE_COMPLETED, MoveReturnValue, PathNavigator} from "../../../src/pathfinder/PathNavigator";
import {ArrayPos} from "../../../src/preprocessing/Prefab";
import {deserializePath, MAX_X, MAX_Y, visualize} from "../../utils/PathTestUtils";
import should from "should";

const MAX_TICKS = 10;

@MemoryMockTestBase.Suite
export class PathNavigatorTest extends MemoryMockTestBase {
  public roadMovementProvider(): DataProviderData<[
    paths: Array<string>, creepsPos: Array<ArrayPos>, targetsPos: Array<ArrayPos>, runForTicks: Array<number>,
  ]> {
    return {
      subData: [{
        args: [
          ["01014x83x54x7", "01092x44x42x4"],
          [ [1, 1], [2, 2], [3, 7] ],
          [ [5, 5], [2, 8], [12, 6] ],
          [ 4, 6, 9 ]
        ],
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

      // visualize(MAX_X, MAX_Y, pathFinderData.roadPosMap, creepMovementMocks.grid);
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
