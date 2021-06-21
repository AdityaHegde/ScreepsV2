import {EventEntryBase, EventHandler} from "./EventEntryBase";
import {Globals} from "../globals/Globals";
import {DEPOSIT_TARGET_POOL_ID, JOB_ASSIGNER_ID} from "../constants";
import {JobAssigner} from "../job/JobAssigner";
import {DepositTargetPool} from "../task/target-pool/DepositTargetPool";

export interface CreepCreatedEventEntry extends EventEntryBase {
  type: "creepCreated";

  creepName: string;
  creepPool: string;
  roomName: string;
}

export class CreepCreatedEventHandler extends EventHandler<CreepCreatedEventEntry> {
  public handle(eventEntry: CreepCreatedEventEntry): boolean {
    const creep = Game.creeps[eventEntry.creepName];
    if (creep.spawning) {
      return true;
    }

    Globals.getGlobalSingleton<JobAssigner>(JOB_ASSIGNER_ID)
      .assign(Game.rooms[eventEntry.roomName], creep, eventEntry.creepPool);
    Globals.getGlobalSingleton<DepositTargetPool<any>>(DEPOSIT_TARGET_POOL_ID)
      .updateTargets(Game.rooms[eventEntry.roomName]);

    return false;
  }
}
