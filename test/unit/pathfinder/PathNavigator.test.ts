import {CreepMovementMocks} from "../../utils/CreepMovementMocks";
import {DataProviderData} from "../../utils/TestBase";
import {PathFinderData} from "@pathfinder/PathFinderData";
import {PathBuilder} from "@pathfinder/PathBuilder";
import {MOVE_COMPLETED, PathNavigator} from "@pathfinder/PathNavigator";
import {ArrayPos} from "../../../src/preprocessing/Prefab";
import {deserializePath, MAX_X, MAX_Y, visualize} from "../../utils/PathTestUtils";
import should from "should";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {GameMocksTestBase} from "../../utils/GameMocksTestBase";

const MAX_TICKS = 20;

@GameMocksTestBase.Suite
export class PathNavigatorTest extends GameMocksTestBase {
  public roadMovementProvider(): DataProviderData<[
    paths: Array<string>, creepsPos: Array<ArrayPos>, targetsPos: Array<ArrayPos>, runForTicks: Array<number>,
  ]> {
    return {
      subData: [{
        title: "Sanity check",
        args: [
          ["01014x83x54x7", "01092x44x42x4", "040624x42", "0407124x4221"],
          [ [1, 1], [2, 2], [3, 7] ],
          [ [5, 5], [2, 8], [11, 6] ],
          [ 4, 6, 9 ],
        ],
      }, {
        title: "Conflict test",
        args: [
          ["01014x83x54x7", "01092x44x42x4", "040624x42", "0407124x4221"],
          [ [2, 2], [4, 4], [19, 14], [16, 11], [11, 7], [13, 9] ],
          [ [4, 4], [2, 2], [16, 11], [19, 14], [9, 9], [9, 9] ],
          [ 2, 3, 3, 3, 2, 4 ],
        ],
      }, {
        title: "Move around circle",
        args: [
          ["05078822446", "070966882244", "09074466882", "070522446688"],
          [ [4, 6], [6, 4], [10, 6], [6, 8], [9, 7] ],
          [ [6, 6], [8, 4], [8, 8], [6, 10], [11, 5] ],
          [ 2, 2, 2, 2, 2 ],
        ],
      }, {
        title: "Move past circle",
        args: [
          [
            "05078822446", "070966882244", "09074466882", "070522446688",
            "06088x5", "08086x5", "08064x5", "06062x5",
          ],
          [ [7, 9], [12, 10], [10, 2], [5, 7] ],
          [ [1, 3], [2, 4], [12, 10], [3, 13] ],
          [ 6, 10, 8, 6 ],
        ],
      }],
    };
  }

  @GameMocksTestBase.Test("roadMovementProvider")
  public shouldMoveAFewCreeps(
    paths: Array<string>, creepsPos: Array<ArrayPos>, targetsPos: Array<ArrayPos>, runForTicks: Array<number>,
  ): void {
    const creepMovementMocks = new CreepMovementMocks(MAX_X, MAX_Y);
    const {pathFinderData, pathBuilder, pathNavigator} = this.getPathFinderInstances();
    paths.forEach(path => pathBuilder.addRoad(deserializePath(path)));

    const creeps = creepsPos.map((creepPos, idx) => {
      const creep = creepMovementMocks.createCreep(`C${idx}`, new RoomPosition(creepPos[0], creepPos[1], "r"));
      const creepWrapper = CreepWrapper.getEntityWrapper<CreepWrapper>(creep.id);
      creepWrapper.entity = creep;
      return creepWrapper;
    });
    const targetRoomPositions = targetsPos.map(targetPos => new RoomPosition(targetPos[0], targetPos[1], "r"));

    const actualRunForTicks = creeps.map(() => 0);
    const reachedCreeps = new Set<string>();

    visualize(MAX_X, MAX_Y, pathFinderData.roadPosMap, creepMovementMocks.grid);

    for (let i = 0; i < MAX_TICKS && reachedCreeps.size < creeps.length; i++) {
      console.log("Tick:", i);
      pathNavigator.preTick();
      creeps.forEach((creep, idx) => {
        if (reachedCreeps.has(creep.id)) return;
        if (creep.hasReachedDest()) {
          reachedCreeps.add(creep.id);
          creep.clearMovement();
          return;
        }
        actualRunForTicks[idx]++;
        pathNavigator.move(creep, targetRoomPositions[idx]);
      });

      pathNavigator.postTick();
      // if (reachedCreeps.size < creeps.length) {
      //   visualize(MAX_X, MAX_Y, pathFinderData.roadPosMap, creepMovementMocks.grid);
      // }
    }

    visualize(MAX_X, MAX_Y, pathFinderData.roadPosMap, creepMovementMocks.grid);

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
