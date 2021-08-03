import {Globals} from "@globals/Globals";
import {ColonyRunner} from "../runner/ColonyRunner";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {ColonyPlanner} from "../colony-planner/ColonyPlanner";
import {ColonyBuildings} from "../building/ColonyBuildings";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {CreepSpawnQueue} from "@wrappers/creeps-spawner/CreepSpawnQueue";
import {GroupRunner} from "../runner/GroupRunner";
import {getBuildGroup, getControllerGroup, getHarvestGroups, getHaulGroup} from "@factory/groupsFactory";

export function simpleRoomRunnerFactory(room: Room): ColonyRunner {
  const pathFinder = Globals.addGlobal(ColonyPathFinder.getColonyPathFinder(room));
  // const pathFinder = Globals.addGlobal(ColonyPathFinder.getTravellerColonyPathFinder(room));
  const creepSpawnQueue = new CreepSpawnQueue(getIdFromRoom(room, "spawn"), room);
  return ColonyRunner.getRoomRunner(
    room,
    Globals.addGlobal(new GroupRunner(getIdFromRoom(room, "group"), room, [
      ...getHarvestGroups(room, pathFinder),
      getHaulGroup(room, pathFinder),
      getControllerGroup(room, pathFinder),
      getBuildGroup(room, pathFinder),
    ], creepSpawnQueue)),
    Globals.addGlobal(ColonyBuildings.getColonyBuildings(room, Globals.addGlobal(ColonyPlanner.getColonyPlan(room, pathFinder)))),
    pathFinder,
    creepSpawnQueue,
  );
}
