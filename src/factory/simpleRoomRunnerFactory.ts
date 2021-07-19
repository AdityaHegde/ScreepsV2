import {Globals} from "@globals/Globals";
import {ColonyRunner} from "../runner/ColonyRunner";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {ColonyPlanner} from "../colony-planner/ColonyPlanner";
import {ColonyBuildings} from "../building/ColonyBuildings";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {CreepSpawnQueue} from "../entity-group/creeps-manager/CreepSpawnQueue";
import {GroupRunner} from "../runner/GroupRunner";
import {getBuildGroup, getControllerUpgradeGroup, getHaulGroup, getSourceHarvestGroup} from "./groupsFactory";
import {getBuildNetworks, getHaulNetworks} from "./jobNetworkFactory";

export function simpleRoomRunnerFactory(room: Room): ColonyRunner {
  const pathFinder = Globals.addGlobal(ColonyPathFinder.getColonyPathFinder(room));
  // const pathFinder = Globals.addGlobal(ColonyPathFinder.getTravellerColonyPathFinder(room));
  const creepSpawnQueue = new CreepSpawnQueue(getIdFromRoom(room, "spawn"), room);
  return ColonyRunner.getRoomRunner(
    room,
    Globals.addGlobal(new GroupRunner(getIdFromRoom(room, "group"), room, [
      ...room.find(FIND_SOURCES).map(source => getSourceHarvestGroup(room, pathFinder, source)),
      getHaulGroup(room, pathFinder, getHaulNetworks(room)),
      getBuildGroup(room, pathFinder, getBuildNetworks(room)),
      getControllerUpgradeGroup(room, pathFinder),
    ], creepSpawnQueue)),
    Globals.addGlobal(ColonyBuildings.getColonyBuildings(room, Globals.addGlobal(ColonyPlanner.getColonyPlan(room, pathFinder)))),
    pathFinder,
    creepSpawnQueue,
  );
}
