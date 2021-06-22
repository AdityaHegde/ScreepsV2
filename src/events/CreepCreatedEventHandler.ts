import {EventEntryBase, EventHandler} from "./EventEntryBase";
import {Globals} from "../globals/Globals";
import {DEPOSIT_TARGET_POOL_ID, JOB_ASSIGNER_ID} from "../constants";
import {JobAssigner} from "../job/JobAssigner";
import {TargetPool} from "../task/target-pool/TargetPool";
import {getIdFromRoom} from "../utils/getIdFromRoom";

export interface CreepCreatedEventEntry extends EventEntryBase {
  type: "creepCreated";

  creepName: string;
  roomName: string;
  creepPoolId: string;
}

export class CreepCreatedEventHandler extends EventHandler<CreepCreatedEventEntry> {
  public handle(eventEntry: CreepCreatedEventEntry): boolean {
    const creep = Game.creeps[eventEntry.creepName];
    if (creep.spawning) {
      return true;
    }

    const room = Game.rooms[eventEntry.roomName];
    Globals.getGlobal<JobAssigner>(JobAssigner as any, getIdFromRoom(room, JOB_ASSIGNER_ID))
      ?.assign(creep, eventEntry.creepPoolId);
    Globals.getGlobal<TargetPool<any, any>>(TargetPool as any, getIdFromRoom(room, DEPOSIT_TARGET_POOL_ID))
      ?.updateTargets();

    return false;
  }
}
