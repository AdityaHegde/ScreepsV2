import {EventEntryBase, EventHandler} from "./EventEntryBase";
import {Globals} from "@globals/Globals";
import {EntityPool} from "../entity-group/entity-pool/EntityPool";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {SOURCE_ID} from "../constants";
import {getWrapperById} from "@wrappers/getWrapperById";

export const ResourceDroppedEventType = "ResourceDroppedEvent";

export interface ResourceDroppedEvent extends EventEntryBase {
  type: typeof ResourceDroppedEventType,
  x: number;
  y: number;
}

export class ResourceDroppedEventHandler extends EventHandler<any> {
  public handle(eventEntry: ResourceDroppedEvent): boolean {
    const room = Game.rooms[eventEntry.roomName];
    const resources = room.lookForAt(LOOK_RESOURCES, eventEntry.x, eventEntry.y);
    if (resources.length === 0) return true;

    const sourceEntityPool = Globals.getGlobal<EntityPool>(EntityPool as any, getIdFromRoom(room, SOURCE_ID));
    if (!sourceEntityPool) return true;

    resources.forEach((resource) => {
      const entityWrapper = getWrapperById(resource.id);
      if (resource.resourceType === RESOURCE_ENERGY) {
        sourceEntityPool.addEntityWrapper(entityWrapper, resource.amount);
      } else {
        // TODO
      }
    });

    return false;
  }

  public static getEvent(roomName: string, x: number, y: number): ResourceDroppedEvent {
    return {
      type: ResourceDroppedEventType,
      roomName, x, y,
    };
  }
}
