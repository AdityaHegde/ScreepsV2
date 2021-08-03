import {BaseEntityType, GameEntity} from "@wrappers/GameEntity";
import {Globals} from "@globals/Globals";

export function getWrapperById(id: string): GameEntity<BaseEntityType> {
  const fromCache = Globals.getGlobal<GameEntity<BaseEntityType>>(GameEntity, id);
  if (fromCache) return fromCache;

  const entity = Game.getObjectById(id);
  const EntityWrapperClass: typeof GameEntity = ((entity as any)?.WRAPPER as typeof GameEntity) ?? GameEntity;

  return EntityWrapperClass.getEntityWrapper(id);
}
