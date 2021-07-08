import {EventEntryBase, EventHandler} from "./EventEntryBase";
import {Globals} from "../globals/Globals";
import {TargetPool} from "../task/target-pool/TargetPool";
import {getIdFromRoom} from "../utils/getIdFromRoom";
import {CONSTRUCT_ENTITY_POOL_ID} from "../constants";

export const ConstructionSiteCreatedEventType = "ConstructionSiteCreated";

export interface ConstructionSiteCreatedEvent extends EventEntryBase {
  type: typeof ConstructionSiteCreatedEventType,
  buildingType: BuildableStructureConstant;
  x: number;
  y: number;
}

export class ConstructionSiteCreatedEventHandler extends EventHandler<any> {
  public handle(eventEntry: ConstructionSiteCreatedEvent): boolean {
    const room = Game.rooms[eventEntry.roomName];
    const sites = room.lookForAt(LOOK_CONSTRUCTION_SITES, eventEntry.x, eventEntry.y)
      .filter(site => site.structureType === eventEntry.buildingType);
    if (sites.length === 0) return true;

    Globals.getGlobal<TargetPool<any, any>>(TargetPool as any, getIdFromRoom(room, CONSTRUCT_ENTITY_POOL_ID))
      ?.addTarget(sites[0]);

    return false;
  }

  public static getEvent(roomName: string, buildingType: BuildableStructureConstant, x: number, y: number): ConstructionSiteCreatedEvent {
    return {
      type: ConstructionSiteCreatedEventType,
      roomName, buildingType, x, y,
    };
  }
}
