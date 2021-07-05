import {Globals} from "@globals/Globals";
import {ColonyRunner} from "../runner/ColonyRunner";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {ColonyPlanner} from "../colony-planner/ColonyPlanner";
import {ColonyBuildings} from "../building/ColonyBuildings";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {CreepSpawnQueue} from "../entity-group/creeps-manager/CreepSpawnQueue";
import {GroupRunner} from "../runner/GroupRunner";
import {getControllerUpgradeGroup, getHaulGroup, getSourceHarvestGroup} from "./groupsFactory";
import {getHaulNetworks} from "./haulNetworkFactory";

export function simpleRoomRunnerFactory(room: Room): ColonyRunner {
  const pathFinder = Globals.addGlobal(ColonyPathFinder.getColonyPathFinder(room));
  const creepSpawnQueue = new CreepSpawnQueue(getIdFromRoom(room, "spawn"), room);
  const harvestGroups = room.find(FIND_SOURCES).map(source => getSourceHarvestGroup(room, pathFinder, source));
  return ColonyRunner.getRoomRunner(
    room,
    Globals.addGlobal(new GroupRunner(getIdFromRoom(room, "group"), room, [
      harvestGroups[0],
      getHaulGroup(room, pathFinder, getHaulNetworks(room)),
      ...harvestGroups.slice(1),
      getControllerUpgradeGroup(room, pathFinder),
    ], creepSpawnQueue)),
    Globals.addGlobal(ColonyBuildings.getColonyBuildings(room, Globals.addGlobal(ColonyPlanner.getColonyPlan(room, pathFinder)))),
    pathFinder,
    creepSpawnQueue,
  );
}

// Globals.addGlobal(JobAssigner.getJobAssigner(room, [
//   Globals.addGlobal(new Job(
//     getIdFromRoom(room, "harvester"), room, getSimpleHarvesterPool(room),
//     [
//       [getSimpleHarvestTask(room, pathFinder)],
//       [getSimpleDepositTask(room, pathFinder), getSimpleConstructTask(room, pathFinder), getSimpleUpgradeTask(room, pathFinder)],
//     ],
//   )),
// ])),
