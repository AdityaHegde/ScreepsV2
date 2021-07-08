import {JobNetwork} from "../entity-group/group/JobNetwork";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {BUILD_ID, CONTROLLER_ID, DEPOSIT_ID, REPAIR_ID, SOURCE_ID} from "../constants";
import {Globals} from "@globals/Globals";
import {EntityPool} from "../entity-group/entity-pool/EntityPool";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";

function getSourceEntityPool(room: Room): EntityPool {
  const id = getIdFromRoom(room, SOURCE_ID);
  return Globals.getGlobal(EntityPool as any, id, () =>
    Globals.addGlobal(new EntityPool(getIdFromRoom(room, SOURCE_ID), room)));
}

export function getHaulNetworks(room: Room, pathFinder: ColonyPathFinder): Array<JobNetwork> {
  const sourceEntityPool = getSourceEntityPool(room);
  return [
    Globals.addGlobal(new JobNetwork(
      getIdFromRoom(room, DEPOSIT_ID), room,
      sourceEntityPool,
      Globals.addGlobal(new EntityPool(getIdFromRoom(room, DEPOSIT_ID), room)), 1,
      RESOURCE_ENERGY,
      pathFinder,
    )),
    Globals.addGlobal(new JobNetwork(
      getIdFromRoom(room, CONTROLLER_ID), room,
      sourceEntityPool,
      Globals.addGlobal(new EntityPool(getIdFromRoom(room, CONTROLLER_ID), room)), 1,
      RESOURCE_ENERGY,
      pathFinder,
    )),
  ];
}

export function getBuildNetworks(room: Room, pathFinder: ColonyPathFinder): Array<JobNetwork> {
  const sourceEntityPool = getSourceEntityPool(room);
  return [
    Globals.addGlobal(new JobNetwork(
      getIdFromRoom(room, BUILD_ID), room,
      sourceEntityPool,
      Globals.addGlobal(new EntityPool(getIdFromRoom(room, BUILD_ID), room)), 1,
      RESOURCE_ENERGY,
      pathFinder,
    )),
    Globals.addGlobal(new JobNetwork(
      getIdFromRoom(room, REPAIR_ID), room,
      sourceEntityPool,
      Globals.addGlobal(new EntityPool(getIdFromRoom(room, REPAIR_ID), room)), REPAIR_POWER / BUILD_POWER,
      RESOURCE_ENERGY,
      pathFinder,
    )),
  ];
}
