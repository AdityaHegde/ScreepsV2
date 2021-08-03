import {GroupsTestBase} from "@test-utils/GroupsTestBase";
import {getHaulGroup} from "@factory/groupsFactory";
import {GroupRunner} from "../../../src/runner/GroupRunner";
import {SourceWrapper} from "@wrappers/positions/SourceWrapper";
import {addControllerToHaulNetwork} from "@factory/jobNetworkFactory";

@GroupsTestBase.Suite
export class ControllerUpgradeTest extends GroupsTestBase {
  @GroupsTestBase.Test()
  public shouldUpgradeController(): void {
    const {room, pathFinder, entities} = this.getBasicVars("r", [1, 9], [[1, 8], [1, 7]],
      null, null);
    const haulJobGroup = getHaulGroup(room, pathFinder);
    const groupRunner = new GroupRunner("r", room, [
      ...entities,
      haulJobGroup,
    ], null);
    addControllerToHaulNetwork(room);

    const {creepWrappers} = this.getCreeps([ [1, 1], [1, 2], [1, 4] ], room);
    haulJobGroup.addEntity(creepWrappers[0]);
    (entities[0] as SourceWrapper).addEntity(creepWrappers[1]);
    (entities[0] as SourceWrapper).addEntity(creepWrappers[2]);

    this.getContainers([ [1, 1] ],
      [CARRY_CAPACITY * 10], [CARRY_CAPACITY * 10],
      true, room);

    this.addPaths(pathFinder);

    for (let i = 0; i < 50; i++) {
      creepWrappers.forEach(creepWrapper => creepWrapper.updateEntity(Game.getObjectById(creepWrapper.id)));
      this.runJobGroup(groupRunner, pathFinder);
    }
  }
}
