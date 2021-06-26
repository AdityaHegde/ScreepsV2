import {Globals} from "../globals/Globals";
import {JobAssigner} from "../job/JobAssigner";
import {ColonyRunner} from "../runner/ColonyRunner";
import {Job} from "../job/Job";
import {getIdFromRoom} from "../utils/getIdFromRoom";
import {CreepPool} from "../job/CreepPool";
import {
  getSimpleConstructTask,
  getSimpleDepositTask,
  getSimpleHarvestTask,
  getSimpleUpgradeTask
} from "./tasksFactories";
import {ColonyPlan} from "../room-planner/ColonyPlan";
import {ColonyBuildings} from "../building/ColonyBuildings";

export function simpleRoomRunnerFactory(room: Room): ColonyRunner {
  return ColonyRunner.getRoomRunner(
    room,
    Globals.addGlobal(JobAssigner.getJobAssigner(room, [
      Globals.addGlobal(new Job(
        getIdFromRoom(room, "harvester"), room,
        Globals.addGlobal(new CreepPool(getIdFromRoom(room, "harvester"), room, 20, "Harvester",
          [WORK, CARRY, MOVE, MOVE], [WORK, CARRY], WORK, true, 12)),
        [
          [getSimpleHarvestTask(room)],
          [getSimpleDepositTask(room), getSimpleConstructTask(room), getSimpleUpgradeTask(room)],
        ],
      )),
    ])),
    Globals.addGlobal(ColonyBuildings.getColonyBuildings(room, Globals.addGlobal(ColonyPlan.getColonyPlan(room)))),
  );
}
