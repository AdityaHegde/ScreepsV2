import {EntityWrapper} from "@wrappers/EntityWrapper";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {Globals} from "@globals/Globals";
import {HarvestableEntityWrapper} from "@wrappers/HarvestableEntityWrapper";
import {ControllerWrapper} from "@wrappers/ControllerWrapper";

export function getWrapperById(id: string): EntityWrapper<any> {
  const fromCache = Globals.getGlobal<EntityWrapper<any>>(EntityWrapper, id);
  if (fromCache) return fromCache;

  const entity = Game.getObjectById(id);
  let EntityWrapperClass: typeof EntityWrapper = EntityWrapper;

  if (entity instanceof Creep) {
    EntityWrapperClass = CreepWrapper as typeof EntityWrapper;
  } else if ((entity instanceof Source) || (entity instanceof Mineral)) {
    EntityWrapperClass = HarvestableEntityWrapper as typeof EntityWrapper;
  } else if (entity instanceof StructureController) {
    EntityWrapperClass = ControllerWrapper as typeof EntityWrapper;
  }

  return EntityWrapperClass.getEntityWrapper(id);
}
