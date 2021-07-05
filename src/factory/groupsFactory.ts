import {HarvestGroup} from "../entity-group/group/HarvestGroup";
import {Globals} from "@globals/Globals";
import {HarvestableEntityWrapper} from "@wrappers/HarvestableEntityWrapper";
import {getWrapperById} from "@wrappers/getWrapperById";
import {HarvesterCreepsSpawner} from "../entity-group/creeps-manager/HarvesterCreepsSpawner";
import {HaulGroup} from "../entity-group/group/haul/HaulGroup";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {CreepsSpawner} from "../entity-group/creeps-manager/CreepsSpawner";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {HAUL_GROUP_ID} from "../constants";
import {HaulNetwork} from "../entity-group/group/haul/HaulNetwork";
import {ControllerUpgradeGroup} from "../entity-group/group/ControllerUpgradeGroup";
import {ControllerWrapper} from "@wrappers/ControllerWrapper";

export function getSourceHarvestGroup(
  room: Room, pathFinder: ColonyPathFinder, target: Source,
): HarvestGroup<HarvestableEntityWrapper<Source>> {
  const creepsSpawner = Globals.addGlobal(
    new HarvesterCreepsSpawner(target.id, room, {
      maxCreeps: 5,
      maxMainPartsCount: 0,
      initParts: [WORK, CARRY, MOVE],
      initMainPartsCount: 1,
      matchCarry: false,
      matchMove: false,
      mainPart: WORK,
    })
  );
  creepsSpawner.harvestTargetId = target.id;
  const harvestGroup = Globals.addGlobal(
    new HarvestGroup<HarvestableEntityWrapper<Source>>(
      target.id, room, creepsSpawner, pathFinder,
      getWrapperById(target.id) as HarvestableEntityWrapper<Source>,
    )
  );
  creepsSpawner.creepGroup = harvestGroup;
  return harvestGroup;
}

export function getHaulGroup(room: Room, pathFinder: ColonyPathFinder, haulNetworks: Array<HaulNetwork>): HaulGroup {
  const id = getIdFromRoom(room, HAUL_GROUP_ID);
  const creepsSpawner = Globals.addGlobal(
    new CreepsSpawner(id, room, {
      maxCreeps: 5,
      maxMainPartsCount: 25,
      initParts: [CARRY, MOVE],
      initMainPartsCount: 1,
      matchCarry: true,
      matchMove: false,
      mainPart: CARRY,
    })
  );
  const haulGroup = Globals.addGlobal(new HaulGroup(id, room, creepsSpawner, pathFinder, haulNetworks));
  creepsSpawner.creepGroup = haulGroup;
  return haulGroup;
}

export function getControllerUpgradeGroup(room: Room, pathFinder: ColonyPathFinder): ControllerUpgradeGroup {
  const id = getIdFromRoom(room, "controller");
  const creepsSpawner = Globals.addGlobal(
    new CreepsSpawner(id, room, {
      maxCreeps: 2,
      maxMainPartsCount: 25,
      initParts: [WORK, CARRY, MOVE],
      initMainPartsCount: 1,
      matchCarry: true,
      matchMove: false,
      mainPart: CARRY,
    }),
  );
  const controllerUpgradeGroup = Globals.addGlobal(
    new ControllerUpgradeGroup(id, room, creepsSpawner, pathFinder,
      Globals.addGlobal(new ControllerWrapper(room.controller.id))));
  creepsSpawner.creepGroup = controllerUpgradeGroup;
  return controllerUpgradeGroup;
}
