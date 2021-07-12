import {EventEntryBase, EventHandler} from "./EventEntryBase";
import {Globals} from "@globals/Globals";
import {ColonyBuildings} from "../building/ColonyBuildings";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {COLONY_BUILDINGS_ID, CONTROLLER_ID, DEPOSIT_ID, SOURCE_ID} from "../constants";
import {EntityPool} from "../entity-group/entity-pool/EntityPool";
import {getWrapperById} from "@wrappers/getWrapperById";
import {isAdjacentToPos, isNearToRoomPosition} from "@pathfinder/PathUtils";
import {ControllerWrapper} from "@wrappers/ControllerWrapper";
import {ContainerActionGroup} from "../entity-group/group/ContainerActionGroup";
import {ControllerUpgradeGroup} from "../entity-group/group/ControllerUpgradeGroup";
import {HarvestableEntityType} from "@wrappers/HarvestableEntityWrapper";
import {HarvestGroup} from "../entity-group/group/HarvestGroup";

export const StructureBuiltEventType = "StructureBuilt";

export interface StructureBuiltEvent extends EventEntryBase {
  type: typeof StructureBuiltEventType;
  buildingType: BuildableStructureConstant;
  x: number;
  y: number;
}

const StructureToTargetMap = {
  [STRUCTURE_SPAWN]: DEPOSIT_ID,
  [STRUCTURE_CONTAINER]: SOURCE_ID,
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
      Globals.getGlobal<EntityPool>(EntityPool as any, getIdFromRoom(room, StructureToTargetMap[eventEntry.buildingType]))
        ?.addEntityWrapper(getWrapperById(sites[0].id), ((sites[0] as any).store as Store<any, any>)?.getCapacity() ?? 0);
    }
    if (sites[0].structureType === STRUCTURE_CONTAINER) {
      this.assignContainer(sites[0] as StructureContainer);
    }

    return false;
  }

  public static getEvent(roomName: string, buildingType: BuildableStructureConstant, x: number, y: number): StructureBuiltEvent {
    return {
      type: StructureBuiltEventType,
      roomName, buildingType, x, y,
    };
  }

  private assignContainer(container: StructureContainer) {
    let containerActionGroup: ContainerActionGroup<any>;

    console.log("assignContainer", JSON.stringify(container.pos))
    if (isNearToRoomPosition(container.pos, container.room.controller.pos, 3)) {
      containerActionGroup = Globals.getGlobal<ControllerUpgradeGroup>(ControllerUpgradeGroup as any,
        getIdFromRoom(container.room, CONTROLLER_ID));
    } else {
      for (const source of container.room.find(FIND_SOURCES)) {
        if (isNearToRoomPosition(container.pos, source.pos)) {
          containerActionGroup = Globals.getGlobal<HarvestGroup<any>>(HarvestGroup as any, source.id);
          break;
        }
      }
    }

    if (containerActionGroup) {
      containerActionGroup.setContainer(container);
    }
  }
}
