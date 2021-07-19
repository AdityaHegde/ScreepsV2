import {GroupsTestBase} from "../utils/GroupsTestBase";
import {getBuildGroup} from "../../src/factory/groupsFactory";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {getBuildNetworks} from "../../src/factory/jobNetworkFactory";
import {deserializePath} from "../utils/PathTestUtils";
import {GroupRunner} from "../../src/runner/GroupRunner";

@GroupsTestBase.Suite
export class BuildJobGroupTest extends GroupsTestBase {
  @GroupsTestBase.Test()
  public shouldBuildStructures(): void {
    const room = new Room("r");
    const pathFinder = ColonyPathFinder.getColonyPathFinder(room);
    const buildJobGroup = getBuildGroup(room, pathFinder, getBuildNetworks(room));
    const groupRunner = new GroupRunner("r", room, [buildJobGroup], null);

    this.runJobGroup(groupRunner, pathFinder);

    const {creepWrappers} = this.getCreeps([ [1, 1], [1, 2], [2, 1] ], room);
    creepWrappers.forEach(creepWrapper => buildJobGroup.addEntityWrapper(creepWrapper));

    const {containers} = this.getContainers([ [1, 1], [1, 2] ], [ CARRY_CAPACITY, CARRY_CAPACITY * 10], room);
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
