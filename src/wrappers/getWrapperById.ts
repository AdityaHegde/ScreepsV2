import {BaseEntityType, EntityWrapper} from "@wrappers/EntityWrapper";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {Globals} from "@globals/Globals";
import {HarvestableEntityWrapper} from "@wrappers/HarvestableEntityWrapper";
import {ControllerWrapper} from "@wrappers/ControllerWrapper";
import {ResourceWrapper} from "@wrappers/ResourceWrapper";

(Creep.prototype as any).WRAPPER = CreepWrapper;
(Source.prototype as any).WRAPPER = HarvestableEntityWrapper;
(Mineral.prototype as any).WRAPPER = HarvestableEntityWrapper;
(StructureController.prototype as any).WRAPPER = ControllerWrapper;

export function getWrapperById(id: string): EntityWrapper<BaseEntityType> {
  const fromCache = Globals.getGlobal<EntityWrapper<BaseEntityType>>(EntityWrapper, id);
  if (fromCache) return fromCache;

  const entity = Game.getObjectById(id);
  let EntityWrapperClass: typeof EntityWrapper = EntityWrapper;

  if ((entity as any).WRAPPER) {
    EntityWrapperClass = (entity as any).WRAPPER as typeof EntityWrapper;
  } else if (id.startsWith(ResourceWrapper.ID_PREFIX)) {
    EntityWrapperClass = ResourceWrapper as typeof EntityWrapper;
  }

  return EntityWrapperClass.getEntityWrapper(id);
}
