import {EventEntryBase, EventHandler} from "./EventEntryBase";
import {Globals} from "@globals/Globals";
import {ColonyBuildings} from "../building/ColonyBuildings";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {COLONY_BUILDINGS_ID, DEPOSIT_ID} from "../constants";
import {getWrapperById} from "@wrappers/getWrapperById";
import {isNearToRoomPosition} from "@pathfinder/PathUtils";
import {WeightedGroup} from "@wrappers/group/WeightedGroup";
import {PositionsEntityType, PositionsEntityWrapper} from "@wrappers/positions/PositionsEntityWrapper";
import {ControllerWrapper} from "@wrappers/positions/ControllerWrapper";
import {SourceWrapper} from "@wrappers/positions/SourceWrapper";

export const StructureBuiltEventType = "StructureBuilt";

export interface StructureBuiltEvent extends EventEntryBase {
  type: typeof StructureBuiltEventType;
  buildingType: BuildableStructureConstant;
  x: number;
  y: number;
}

const StructureToTargetMap = {
  [STRUCTURE_SPAWN]: DEPOSIT_ID,
  [STRUCTURE_EXTENSION]: DEPOSIT_ID,
};

export class StructureBuiltEventHandler extends EventHandler<StructureBuiltEvent> {
  public handle(eventEntry: StructureBuiltEvent): boolean {
    const room = Game.rooms[eventEntry.roomName];
    const structures = room.lookForAt("structure", eventEntry.x, eventEntry.y)
      .filter(site => site.structureType === eventEntry.buildingType);
    console.log("StructureBuiltEventHandler", JSON.stringify(eventEntry), structures.length);
    if (structures.length === 0) {
      return true;
    }

    const colonyBuildings = Globals.getGlobal<ColonyBuildings>(ColonyBuildings as any, getIdFromRoom(room, COLONY_BUILDINGS_ID));
    if (colonyBuildings) {
      colonyBuildings.siteCount--;
    }

    if (eventEntry.buildingType in StructureToTargetMap) {
      Globals.getGlobal<WeightedGroup>(WeightedGroup, getIdFromRoom(room, StructureToTargetMap[eventEntry.buildingType]))
        ?.addWeightedEntity(getWrapperById(structures[0].id), ((structures[0] as any).store as Store<any, any>)?.getCapacity() ?? 0);
    }
    if (structures[0].structureType === STRUCTURE_CONTAINER) {
      this.assignContainer(structures[0] as StructureContainer);
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
    let containerActionGroup: PositionsEntityWrapper<PositionsEntityType>;

    if (isNearToRoomPosition(container.pos, container.room.controller.pos, 3)) {
      containerActionGroup = getWrapperById(container.room.controller.id) as ControllerWrapper;
    } else {
      for (const source of container.room.find(FIND_SOURCES)) {
        if (isNearToRoomPosition(container.pos, source.pos)) {
          containerActionGroup = getWrapperById(source.id) as SourceWrapper;
          break;
        }
      }
    }

    if (containerActionGroup) {
      console.log(`Assigning Container to id=${containerActionGroup.id} pos=${JSON.stringify(container.pos)}`);
      containerActionGroup.setContainer(container);
    }
  }
}
