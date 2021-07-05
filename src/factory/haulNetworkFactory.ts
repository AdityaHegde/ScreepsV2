import {HaulNetwork} from "../entity-group/group/haul/HaulNetwork";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {CONTROLLER_ID, DEPOSIT_ID, SOURCE_ID} from "../constants";
import {Globals} from "@globals/Globals";
import {EntityPool} from "../entity-group/entity-pool/EntityPool";

export function getHaulNetworks(room: Room): Array<HaulNetwork> {
  const sourceEntityPool = Globals.addGlobal(new EntityPool(getIdFromRoom(room, SOURCE_ID), room));
  return [
    Globals.addGlobal(new HaulNetwork(
      getIdFromRoom(room, DEPOSIT_ID), room,
      sourceEntityPool,
      Globals.addGlobal(new EntityPool(getIdFromRoom(room, DEPOSIT_ID), room)),
      RESOURCE_ENERGY,
    )),
    Globals.addGlobal(new HaulNetwork(
      getIdFromRoom(room, CONTROLLER_ID), room,
      sourceEntityPool,
      Globals.addGlobal(new EntityPool(getIdFromRoom(room, CONTROLLER_ID), room)),
      RESOURCE_ENERGY,
    )),
  ];
}
