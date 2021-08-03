import should from "should";
import {GroupsTestBase} from "@test-utils/GroupsTestBase";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {GroupRunner} from "../../../src/runner/GroupRunner";
import {getHaulGroup} from "@factory/groupsFactory";
import {deserializePath} from "@test-utils/PathTestUtils";

@GroupsTestBase.Suite
export class HaulJobTest extends GroupsTestBase {
  @GroupsTestBase.Test()
  public shouldHaul(): void {
    const room = new Room("r");
    const pathFinder = ColonyPathFinder.getColonyPathFinder(room);
    const haulJobGroup = getHaulGroup(room, pathFinder);
    const groupRunner = new GroupRunner("r", room, [haulJobGroup], null);

    this.runJobGroup(groupRunner, pathFinder);

    const {creepWrappers} = this.getCreeps([ [1, 1], [1, 2] ], room, [2, 1]);
    creepWrappers.forEach(creepWrapper => haulJobGroup.addEntity(creepWrapper));

    const sourceContainers = this.getContainers([ [1, 5], [1, 6] ],
      [CARRY_CAPACITY * 10, CARRY_CAPACITY * 10], [CARRY_CAPACITY * 10, CARRY_CAPACITY * 10],
      true, room);
    const targetContainers = this.getContainers([ [5, 1], [6, 1], [7, 1] ],
      [CARRY_CAPACITY * 2, CARRY_CAPACITY * 2, CARRY_CAPACITY * 2],
      [CARRY_CAPACITY / 2, CARRY_CAPACITY / 2, 0],
      false, room);

    pathFinder.pathBuilder.addRoad(deserializePath("01013x9"));
    pathFinder.pathBuilder.addRoad(deserializePath("01014x9"));
    pathFinder.pathBuilder.addRoad(deserializePath("01015x9"));

    for (let i = 0; i < 50; i++) {
      creepWrappers.forEach(creepWrapper => creepWrapper.updateEntity(Game.getObjectById(creepWrapper.id)));
      this.runJobGroup(groupRunner, pathFinder);
    }

    should(sourceContainers.containers.map(container => container.store.getUsedCapacity())).be.eql([250, 500]);
    should(targetContainers.containers.map(container => container.store.getFreeCapacity())).be.eql([0, 0, 0]);
  }
}
