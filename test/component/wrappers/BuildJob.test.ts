import {GroupsTestBase} from "@test-utils/GroupsTestBase";
import {getBuildGroup} from "@factory/groupsFactory";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {deserializePath} from "@test-utils/PathTestUtils";
import {GroupRunner} from "../../../src/runner/GroupRunner";

@GroupsTestBase.Suite
export class BuildJobTest extends GroupsTestBase {
  @GroupsTestBase.Test()
  public shouldBuildStructures(): void {
    const room = new Room("r");
    const pathFinder = ColonyPathFinder.getColonyPathFinder(room);
    const buildJobGroup = getBuildGroup(room, pathFinder);
    const groupRunner = new GroupRunner("r", room, [buildJobGroup], null);

    this.runJobGroup(groupRunner, pathFinder);

    const {creepWrappers} = this.getCreeps([ [1, 1], [1, 2], [2, 1] ], room);
    creepWrappers.forEach(creepWrapper => buildJobGroup.addEntity(creepWrapper));

    const {containers} = this.getContainers([ [1, 1], [1, 2] ],
      [CARRY_CAPACITY, CARRY_CAPACITY * 10],
      [CARRY_CAPACITY, CARRY_CAPACITY * 10],
      true, room);
    containers[0].store.addEnergy(-2);

    const {constructionSites, constructionSiteWrappers} = this.getConstructionSites([ [1, 7], [7, 7], [7, 1] ],
      ["container", "container", "road"], [160, 200, 25], room);

    pathFinder.pathBuilder.addRoad(deserializePath("01013x9"));
    pathFinder.pathBuilder.addRoad(deserializePath("01014x9"));
    pathFinder.pathBuilder.addRoad(deserializePath("01015x9"));

    for (let i = 0; i < 50; i++) {
      creepWrappers.forEach(creepWrapper => creepWrapper.updateEntity(Game.getObjectById(creepWrapper.id)));
      this.runJobGroup(groupRunner, pathFinder);
      constructionSites.forEach((constructionSite, idx) => {
        if (constructionSite.progress >= constructionSite.progressTotal) {
          this.gameMocks.destroy(constructionSite);
        }
        constructionSiteWrappers[idx].updateEntity(Game.getObjectById(constructionSite.id));
      });
    }
  }
}
