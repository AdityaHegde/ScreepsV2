import {HarvestGroup} from "../entity-group/group/HarvestGroup";
import {Globals} from "@globals/Globals";
import {HarvestableEntityWrapper} from "@wrappers/HarvestableEntityWrapper";
import {getWrapperById} from "@wrappers/getWrapperById";
import {HarvesterCreepsSpawner} from "../entity-group/creeps-manager/HarvesterCreepsSpawner";
import {HaulGroupActions} from "../entity-group/group/HaulGroupActions";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {CreepsSpawner} from "../entity-group/creeps-manager/CreepsSpawner";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {BUILD_GROUP_ID, HAUL_GROUP_ID} from "../constants";
import {JobNetwork} from "../entity-group/group/JobNetwork";
import {ControllerUpgradeGroup} from "../entity-group/group/ControllerUpgradeGroup";
import {ControllerWrapper} from "@wrappers/ControllerWrapper";
import {ControllerUpgradeSpawner} from "../entity-group/creeps-manager/ControllerUpgradeSpawner";
import {JobGroup} from "../entity-group/group/JobGroup";
import {BuildGroupActions} from "../entity-group/group/BuildGroupActions";

export function getSourceHarvestGroup(
  room: Room, pathFinder: ColonyPathFinder, target: Source,
): HarvestGroup<HarvestableEntityWrapper<Source>> {
  const creepsSpawner = Globals.addGlobal(
    new HarvesterCreepsSpawner(target.id, room, {
      maxCreeps: 3,
      maxMainPartsCount: 0,
      initParts: [WORK, CARRY, MOVE],
      initMainPartsCount: 1,
      matchCarry: false,
      matchMove: false,
      mainPart: WORK,
    }),
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

export function getHaulGroup(room: Room, pathFinder: ColonyPathFinder, haulNetworks: Array<JobNetwork>): JobGroup {
  const id = getIdFromRoom(room, HAUL_GROUP_ID);
  const creepsSpawner = Globals.addGlobal(
    new CreepsSpawner(id, room, {
      maxCreeps: 5,
      maxMainPartsCount: 25,
      initParts: [CARRY, MOVE],
      initMainPartsCount: 1,
      matchCarry: false,
      matchMove: false,
      mainPart: CARRY,
    })
  );
  const haulGroup = Globals.addGlobal(
    new JobGroup(id, room, creepsSpawner, pathFinder, haulNetworks, new HaulGroupActions(CARRY_CAPACITY, CARRY_CAPACITY)),
  );
  creepsSpawner.creepGroup = haulGroup;
  return haulGroup;
}

export function getBuildGroup(room: Room, pathFinder: ColonyPathFinder, haulNetworks: Array<JobNetwork>): JobGroup {
  const id = getIdFromRoom(room, BUILD_GROUP_ID);
  const creepsSpawner = Globals.addGlobal(
    new CreepsSpawner(id, room, {
      maxCreeps: 5,
      maxMainPartsCount: 10,
      initParts: [CARRY, WORK, MOVE],
      initMainPartsCount: 1,
      matchCarry: true,
      matchMove: false,
      mainPart: WORK,
    })
  );
  const buildGroup = Globals.addGlobal(
    new JobGroup(id, room, creepsSpawner, pathFinder, haulNetworks, new BuildGroupActions(CARRY_CAPACITY, BUILD_POWER)),
  );
  creepsSpawner.creepGroup = buildGroup;
  return buildGroup;
}

export function getControllerUpgradeGroup(room: Room, pathFinder: ColonyPathFinder): ControllerUpgradeGroup {
  const id = getIdFromRoom(room, "controller");
  const creepsSpawner = Globals.addGlobal(
    new ControllerUpgradeSpawner(id, room, {
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
