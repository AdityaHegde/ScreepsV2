import {EventEntryBase, EventHandler} from "./EventEntryBase";
import {Globals} from "@globals/Globals";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {BUILD_ID} from "../constants";
import {getWrapperById} from "@wrappers/getWrapperById";
import {WeightedGroup} from "@wrappers/group/WeightedGroup";

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

    const buildEntityPool = Globals.getGlobal<WeightedGroup>(WeightedGroup, getIdFromRoom(room, BUILD_ID));
    if (!buildEntityPool) return true;

    sites.forEach(site => buildEntityPool.addWeightedEntity(getWrapperById(site.id), site.progressTotal));

    return false;
  }

  public static getEvent(roomName: string, buildingType: BuildableStructureConstant, x: number, y: number): ConstructionSiteCreatedEvent {
    return {
      type: ConstructionSiteCreatedEventType,
      roomName, buildingType, x, y,
    };
  }
}
