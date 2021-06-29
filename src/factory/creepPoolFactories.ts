import {CreepPool} from "../creep-pool/CreepPool";
import {Globals} from "../globals/Globals";
import {getIdFromRoom} from "../utils/getIdFromRoom";
import {CreepPartsManager} from "../creep-pool/CreepPartsManager";
import {CreepSpawner} from "../creep-pool/CreepSpawner";
import {CreepPoolStrategy} from "../creep-pool/creep-pool-strategy/CreepPoolStrategy";

export function getSimpleHarvesterPool(room: Room): CreepPool {
  const id = getIdFromRoom(room, "harvester");
  const creepPoolStrategy = new CreepPoolStrategy(id, room, 20, 2);
  const partsManager = Globals.addGlobal(new CreepPartsManager(id, room,
    [WORK, CARRY, MOVE, MOVE], [WORK, CARRY], WORK, true, creepPoolStrategy));
  return Globals.addGlobal(new CreepPool(
    id, room, partsManager,
    Globals.addGlobal(new CreepSpawner(id, room, "harvester", partsManager, creepPoolStrategy)),
    creepPoolStrategy,
  ));
}
