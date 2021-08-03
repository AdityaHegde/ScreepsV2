import {JobGroup} from "@wrappers/group/JobGroup";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {BUILD_GROUP_ID, CONTROLLER_ID, HAUL_GROUP_ID} from "../constants";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {JobGroupActions} from "@wrappers/group/JobGroupActions";
import {getBuildNetworks, getHaulNetworks} from "@factory/jobNetworkFactory";
import {Globals} from "@globals/Globals";
import {CreepsSpawner} from "@wrappers/creeps-spawner/CreepsSpawner";
import {HarvesterCreepsSpawner} from "@wrappers/creeps-spawner/HarvesterCreepsSpawner";
import {ControllerWrapper} from "@wrappers/positions/ControllerWrapper";
import {ControllerUpgradeSpawner} from "@wrappers/creeps-spawner/ControllerUpgradeSpawner";
import {BuildGroupActions} from "@wrappers/group/BuildGroupActions";
import {SourceWrapper} from "@wrappers/positions/SourceWrapper";

export function getHaulGroup(room: Room, pathFinder: ColonyPathFinder): JobGroup {
  const id = getIdFromRoom(room, HAUL_GROUP_ID);
  const creepsSpawner = Globals.addGlobal(new CreepsSpawner(id, room, {
    maxCreeps: 3,
    maxMainPartsCount: 25,
    initParts: [CARRY, MOVE],
    matchCarry: false,
    matchMove: false,
    mainPart: CARRY,
  }));
  return Globals.addGlobal(new JobGroup(id, creepsSpawner, pathFinder, getHaulNetworks(room), new JobGroupActions()));
}

export function getHarvestGroup(source: Source, room: Room, pathFinder: ColonyPathFinder): SourceWrapper {
  const creepsSpawner = Globals.addGlobal(new HarvesterCreepsSpawner(source.id, room, {
    maxCreeps: 3,
    maxMainPartsCount: 0,
    initParts: [WORK, CARRY, MOVE],
    matchCarry: false,
    matchMove: false,
    mainPart: WORK,
  }));
  return Globals.addGlobal(new SourceWrapper(source.id, creepsSpawner, pathFinder));
}
export function getHarvestGroups(room: Room, pathFinder: ColonyPathFinder): Array<SourceWrapper> {
  return room.find(FIND_SOURCES).map(source => getHarvestGroup(source, room, pathFinder));
}

export function getControllerGroup(room: Room, pathFinder: ColonyPathFinder): ControllerWrapper {
  const creepsSpawner = Globals.addGlobal(
    new ControllerUpgradeSpawner(room.controller.id, room, {
      maxCreeps: 2,
      maxMainPartsCount: 25,
      initParts: [WORK, WORK, CARRY, MOVE],
      matchCarry: false,
      matchMove: false,
      mainPart: WORK,
    }),
  );
  return Globals.addGlobal(new ControllerWrapper(room.controller.id, creepsSpawner, pathFinder));
}

export function getBuildGroup(room: Room, pathFinder: ColonyPathFinder): JobGroup {
  const id = getIdFromRoom(room, BUILD_GROUP_ID);
  const creepsSpawner = Globals.addGlobal(
    new CreepsSpawner(id, room, {
      maxCreeps: 5,
      maxMainPartsCount: 10,
      initParts: [CARRY, WORK, MOVE, MOVE],
      matchCarry: false,
      matchMove: false,
      mainPart: WORK,
    })
  );
  return Globals.addGlobal(new JobGroup(id, creepsSpawner, pathFinder, getBuildNetworks(room), new BuildGroupActions()));
}
