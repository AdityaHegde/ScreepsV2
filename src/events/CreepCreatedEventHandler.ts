import {EventEntryBase, EventHandler} from "./EventEntryBase";
import {Globals} from "@globals/Globals";
import {CreepGroup} from "../entity-group/group/CreepGroup";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {CreepsSpawner} from "../entity-group/creeps-manager/CreepsSpawner";

export const CreepCreatedEventEntryType = "CreepCreated";

export interface CreepCreatedEventEntry extends EventEntryBase {
  type: typeof CreepCreatedEventEntryType;

  creepName: string;
  power: number;
  groupId: string;
}

export class CreepCreatedEventHandler extends EventHandler<CreepCreatedEventEntry> {
  public handle(eventEntry: CreepCreatedEventEntry): boolean {
    const creep = Game.creeps[eventEntry.creepName];
    if (creep.spawning) {
      return true;
    }

    const creepWrapper: CreepWrapper = CreepWrapper.getEntityWrapper(creep.id);
    creepWrapper.power = eventEntry.power;
    Globals.getGlobal<CreepGroup>(CreepGroup as any, eventEntry.groupId)?.addEntityWrapper(
      CreepWrapper.getEntityWrapper(creep.id),
    );
    Globals.getGlobal<CreepsSpawner>(CreepsSpawner as any, eventEntry.groupId)?.spawnedCreep();
    // we do not use this memory
    delete Memory.creeps[eventEntry.creepName];

    return false;
  }

  public static getEvent(roomName: string, creepName: string, power: number, groupId: string): CreepCreatedEventEntry {
    return {
      type: CreepCreatedEventEntryType,
      roomName, creepName, power, groupId,
    };
  }
}
