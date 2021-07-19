import {GroupsTestBase} from "../utils/GroupsTestBase";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {getControllerUpgradeGroup, getHaulGroup} from "../../src/factory/groupsFactory";
import {getHaulNetworks} from "../../src/factory/jobNetworkFactory";
import {GroupRunner} from "../../src/runner/GroupRunner";
import {deserializePath} from "../utils/PathTestUtils";

@GroupsTestBase.Suite
export class ControllerUpgradeTest extends GroupsTestBase {
  @GroupsTestBase.Test()
  public shouldBuildStructures(): void {
    const room = new Room("r");
    const pathFinder = ColonyPathFinder.getColonyPathFinder(room);

    const {controllerWrapper} = this.getController([1, 8], room);
    controllerWrapper.init([1, 5], [1, 4]);

    const haulJobGroup = getHaulGroup(room, pathFinder, getHaulNetworks(room));
    const controllerUpgradeGroup = getControllerUpgradeGroup(room, pathFinder);
    const groupRunner = new GroupRunner("r", room, [haulJobGroup, controllerUpgradeGroup], null);

    this.runJobGroup(groupRunner, pathFinder);

    const {creepWrappers} = this.getCreeps([ [1, 1], [1, 2], [1, 3] ], room);
    // haulJobGroup.addEntityWrapper(creepWrappers[0]);
    controllerUpgradeGroup.addEntityWrapper(creepWrappers[1]);
    controllerUpgradeGroup.addEntityWrapper(creepWrappers[2]);

    this.getContainers([ [1, 1] ], [ CARRY_CAPACITY * 10], room);

    pathFinder.pathBuilder.addRoad(deserializePath("01015x9"));

    for (let i = 0; i < 50; i++) {
      creepWrappers.forEach(creepWrapper => creepWrapper.updateEntity(Game.getObjectById(creepWrapper.id)));
      this.runJobGroup(groupRunner, pathFinder);
      if (i === 5) haulJobGroup.addEntityWrapper(creepWrappers[0]);
    }

    console.log(JSON.stringify(this.memory));
  }
}
