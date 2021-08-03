import {GroupsTestBase} from "@test-utils/GroupsTestBase";
import {getHaulGroup} from "@factory/groupsFactory";
import {GroupRunner} from "../../../src/runner/GroupRunner";
import {SourceWrapper} from "@wrappers/positions/SourceWrapper";

@GroupsTestBase.Suite
export class HarvestTest extends GroupsTestBase {
  @GroupsTestBase.Test()
  public shouldHarvest(): void {
    const {room, pathFinder, entities} = this.getBasicVars("r", null, null,
      [[1, 9], [9, 1]], [ [[1, 8], [1, 7]], [[8, 1], [7, 1]] ]);
    const haulJobGroup = getHaulGroup(room, pathFinder);
    const groupRunner = new GroupRunner("r", room, [
      ...entities,
      haulJobGroup,
    ], null);

    this.runJobGroup(groupRunner, pathFinder);

    const {creepWrappers} = this.getCreeps([ [1, 1], [1, 2], [1, 4], [2, 1], [4, 1] ], room);
    haulJobGroup.addEntity(creepWrappers[0]);
    (entities[0] as SourceWrapper).addEntity(creepWrappers[1]);
    (entities[0] as SourceWrapper).addEntity(creepWrappers[2]);
    (entities[1] as SourceWrapper).addEntity(creepWrappers[3]);
    (entities[1] as SourceWrapper).addEntity(creepWrappers[4]);

    this.getContainers([ [1, 1] ],
      [CARRY_CAPACITY * 10], [0],
      false, room);

    this.addPaths(pathFinder);

    for (let i = 0; i < 50; i++) {
      creepWrappers.forEach(creepWrapper => creepWrapper.updateEntity(Game.getObjectById(creepWrapper.id)));
      this.runJobGroup(groupRunner, pathFinder);
    }
  }
}
