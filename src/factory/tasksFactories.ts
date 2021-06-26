import {Globals} from "../globals/Globals";
import {Task} from "../task/Task";
import {getIdFromRoom} from "../utils/getIdFromRoom";
import {SourceTarget} from "../task/target/SourceTarget";
import {TargetPool} from "../task/target-pool/TargetPool";
import {DepositTarget, DepositTargetType} from "../task/target/DepositTarget";
import {CONSTRUCT_TARGET_POOL_ID, DEPOSIT_TARGET_POOL_ID} from "../constants";
import {UpgradeTarget} from "../task/target/UpgradeTarget";
import {ConstructTarget} from "../task/target/ConstructTarget";

export function getSimpleHarvestTask(room: Room): Task<Source, SourceTarget> {
  const sourceTarget = new SourceTarget();
  return Globals.addGlobal(new Task(getIdFromRoom(room, "harvest"), room, sourceTarget,
    Globals.addGlobal(new TargetPool<Source, SourceTarget>(
      getIdFromRoom(room, "source"), room, sourceTarget))));
}

export function getSimpleDepositTask(room: Room): Task<DepositTargetType, DepositTarget> {
  const depositTarget = new DepositTarget(RESOURCE_ENERGY, [STRUCTURE_SPAWN, STRUCTURE_CONTAINER]);
  return Globals.addGlobal(new Task(getIdFromRoom(room, "deposit"), room, depositTarget,
    Globals.addGlobal(new TargetPool<DepositTargetType, DepositTarget>(
      getIdFromRoom(room, DEPOSIT_TARGET_POOL_ID), room, depositTarget))));
}

export function getSimpleUpgradeTask(room: Room): Task<StructureController, UpgradeTarget> {
  const upgradeTarget = new UpgradeTarget();
  return Globals.addGlobal(new Task(getIdFromRoom(room, "upgrade"), room, upgradeTarget,
    Globals.addGlobal(new TargetPool<StructureController, UpgradeTarget>(
      getIdFromRoom(room, "upgrade"), room, upgradeTarget))));
}

export function getSimpleConstructTask(room: Room): Task<ConstructionSite, ConstructTarget> {
  const constructTarget = new ConstructTarget();
  return Globals.addGlobal(new Task(getIdFromRoom(room, "construct"), room, constructTarget,
    Globals.addGlobal(new TargetPool<ConstructionSite, ConstructTarget>(
      getIdFromRoom(room, CONSTRUCT_TARGET_POOL_ID), room, constructTarget))));
}
