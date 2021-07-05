import {EventEntryBase, EventHandler} from "./EventEntryBase";
import {Globals} from "../globals/Globals";
import {ColonyBuildings} from "../building/ColonyBuildings";
import {getIdFromRoom} from "../utils/getIdFromRoom";
import {COLONY_BUILDINGS_ID, DEPOSIT_ID} from "../constants";
import {TargetPool} from "../task/target-pool/TargetPool";

export const StructureBuiltEventType = "StructureBuilt";

export interface StructureBuiltEvent extends EventEntryBase {
  type: typeof StructureBuiltEventType;
  buildingType: BuildableStructureConstant;
  x: number;
  y: number;
}

const StructureToTargetMap = {
  [STRUCTURE_SPAWN]: DEPOSIT_ID,
  [STRUCTURE_CONTAINER]: DEPOSIT_ID,
};

export class StructureBuiltEventHandler extends EventHandler<StructureBuiltEvent> {
  public handle(eventEntry: StructureBuiltEvent): boolean {
    const room = Game.rooms[eventEntry.roomName];
    const sites = room.lookForAt("structure", eventEntry.x, eventEntry.y)
      .filter(site => site.structureType === eventEntry.buildingType);
    if (sites.length === 0) {
      return true;
    }

    const colonyBuildings = Globals.getGlobal<ColonyBuildings>(ColonyBuildings as any, getIdFromRoom(room, COLONY_BUILDINGS_ID));
    if (colonyBuildings) {
      colonyBuildings.siteCount--;
    }

    if (eventEntry.buildingType in StructureToTargetMap) {
      Globals.getGlobal<TargetPool<any, any>>(TargetPool as any, getIdFromRoom(room, StructureToTargetMap[eventEntry.buildingType]))
        ?.addTarget(sites[0]);
    }

    return false;
  }

  public static getEvent(roomName: string, buildingType: BuildableStructureConstant, x: number, y: number): StructureBuiltEvent {
    return {
      type: StructureBuiltEventType,
      roomName, buildingType, x, y,
    };
  }
}
