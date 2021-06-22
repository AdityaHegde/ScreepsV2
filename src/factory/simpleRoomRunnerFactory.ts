import {Globals} from "../globals/Globals";
import {JobAssigner} from "../job/JobAssigner";
import {RoomRunner} from "../runner/RoomRunner";
import {Job} from "../job/Job";
import {getIdFromRoom} from "../utils/getIdFromRoom";
import {CreepPool} from "../job/CreepPool";
import {Task} from "../task/Task";
import {SourceTarget} from "../task/target/SourceTarget";
import {TargetPool} from "../task/target-pool/TargetPool";
import {DEPOSIT_TARGET_POOL_ID} from "../constants";
import {DepositTarget, DepositTargetType} from "../task/target/DepositTarget";

export function simpleRoomRunnerFactory(room: Room): RoomRunner {
  const depositTarget = new DepositTarget(RESOURCE_ENERGY, [STRUCTURE_SPAWN, STRUCTURE_CONTAINER]);
  return RoomRunner.getRoomRunner(room, Globals.addGlobal(JobAssigner.getJobAssigner(room, [
    Globals.addGlobal(new Job(
      getIdFromRoom(room, "harvester"), room,
      Globals.addGlobal(new CreepPool(getIdFromRoom(room, "harvester"), room, 10, "Harvester",
        [WORK, CARRY, MOVE, MOVE], [WORK, CARRY], WORK, true, 12)),
      [
        [Globals.addGlobal(new Task(getIdFromRoom(room, "harvest"), room, new SourceTarget(),
          Globals.addGlobal(new TargetPool<Source, SourceTarget>(
            getIdFromRoom(room, "source"), room, new SourceTarget()))))],
        [Globals.addGlobal(new Task(getIdFromRoom(room, "deposit"), room, depositTarget,
          Globals.addGlobal(new TargetPool<DepositTargetType, DepositTarget>(
            getIdFromRoom(room, DEPOSIT_TARGET_POOL_ID), room, depositTarget))))],
      ],
    )),
  ])));
}
