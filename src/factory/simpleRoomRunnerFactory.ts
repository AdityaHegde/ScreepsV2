import {Globals} from "../globals/Globals";
import {JobAssigner} from "../job/JobAssigner";
import {ColonyRunner} from "../runner/ColonyRunner";
import {Job} from "../job/Job";
import {getIdFromRoom} from "../utils/getIdFromRoom";
import {
  getSimpleConstructTask,
  getSimpleDepositTask,
  getSimpleHarvestTask,
  getSimpleUpgradeTask
} from "./tasksFactories";
import {ColonyPlan} from "../colony-planner/ColonyPlan";
import {ColonyBuildings} from "../building/ColonyBuildings";
import {getSimpleHarvesterPool} from "./creepPoolFactories";
import {ColonyPathFinder} from "../pathfinder/ColonyPathFinder";

export function simpleRoomRunnerFactory(room: Room): ColonyRunner {
  const pathFinder = Globals.addGlobal(ColonyPathFinder.getColonyPathFinder(room));
  return ColonyRunner.getRoomRunner(
    room,
    Globals.addGlobal(JobAssigner.getJobAssigner(room, [
      Globals.addGlobal(new Job(
        getIdFromRoom(room, "harvester"), room, getSimpleHarvesterPool(room),
        [
          [getSimpleHarvestTask(room, pathFinder)],
          [getSimpleDepositTask(room, pathFinder), getSimpleConstructTask(room, pathFinder), getSimpleUpgradeTask(room, pathFinder)],
        ],
      )),
    ])),
    Globals.addGlobal(ColonyBuildings.getColonyBuildings(room, Globals.addGlobal(ColonyPlan.getColonyPlan(room, pathFinder)))),
    pathFinder,
  );
}
