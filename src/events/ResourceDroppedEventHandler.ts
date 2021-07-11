import {EventEntryBase, EventHandler} from "./EventEntryBase";
import {Globals} from "@globals/Globals";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {SOURCE_ID} from "../constants";
import {getWrapperById} from "@wrappers/getWrapperById";
import {ResourceEntityPool} from "../entity-group/entity-pool/ResourceEntityPool";

export const ResourceDroppedEventType = "ResourceDroppedEvent";

export interface ResourceDroppedEvent extends EventEntryBase {
  type: typeof ResourceDroppedEventType,
  x: number;
  y: number;
  dropAmount: number;
}

export class ResourceDroppedEventHandler extends EventHandler<any> {
  public handle(eventEntry: ResourceDroppedEvent): boolean {
    const room = Game.rooms[eventEntry.roomName];
    const resources = room.lookForAt(LOOK_RESOURCES, eventEntry.x, eventEntry.y);
    if (resources.length === 0) return true;

    const sourceEntityPool = Globals.getGlobal<ResourceEntityPool>(ResourceEntityPool as any, getIdFromRoom(room, SOURCE_ID));

    resources.forEach((resource) => {
      sourceEntityPool.addEntityWrapper(getWrapperById(resource.id), resource.amount);
    });

    return false;
  }

  public static getEvent(roomName: string, x: number, y: number, dropAmount: number): ResourceDroppedEvent {
    return {
      type: ResourceDroppedEventType,
      roomName, x, y, dropAmount,
    };
  }
}
