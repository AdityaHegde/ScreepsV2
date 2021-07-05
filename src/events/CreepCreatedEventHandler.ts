import {EventEntryBase, EventHandler} from "./EventEntryBase";
import {Globals} from "@globals/Globals";
import {CreepGroup} from "../entity-group/group/CreepGroup";
import {CreepWrapper} from "@wrappers/CreepWrapper";

export const CreepCreatedEventEntryType = "CreepCreated";

export interface CreepCreatedEventEntry extends EventEntryBase {
  type: typeof CreepCreatedEventEntryType;

  creepName: string;
  groupId: string;
}

export class CreepCreatedEventHandler extends EventHandler<CreepCreatedEventEntry> {
  public handle(eventEntry: CreepCreatedEventEntry): boolean {
    const creep = Game.creeps[eventEntry.creepName];
    if (creep.spawning) {
      return true;
    }

    Globals.getGlobal<CreepGroup>(CreepGroup as any, eventEntry.groupId)?.addEntityWrapper(
      CreepWrapper.getEntityWrapper(creep.id),
    );

    return false;
  }

  public static getEvent(roomName: string, creepName: string, groupId: string): CreepCreatedEventEntry {
    return {
      type: CreepCreatedEventEntryType,
      roomName, creepName, groupId,
    };
  }
}
