import {Entity} from "@wrappers/Entity";
import {inMemory} from "@memory/inMemory";
import {BaseEntityType, GameEntity} from "@wrappers/GameEntity";
import {getWrapperById} from "@wrappers/getWrapperById";
import {CreepsSpawner} from "@wrappers/creeps-spawner/CreepsSpawner";

export class EntityGroup<EntityType extends GameEntity<BaseEntityType>> extends Entity {
  @inMemory(() => [])
  public entityIds: Array<string>;

  public creepSpawner: CreepsSpawner;

  public constructor(id: string, creepSpawner: CreepsSpawner) {
    super(id);
    this.creepSpawner = creepSpawner;
  }

  public addEntity(entity: EntityType): void {
    this.logger.log(`Adding entity ${entity.id} to ${this.id}`);
    this.entityIds.push(entity.id);
  }

  public forEachEntity(
    callback: (entity: EntityType) => void,
    deadCallback?: (entity: EntityType) => void,
  ): void {
    const deadEntities = new Array<EntityType>();
    const newEntityIds = new Array<string>();

    this.entityIds.forEach((entityId) => {
      const entity = getWrapperById(entityId) as EntityType;
      this.logger.setEntityWrapper(entity);

      if (!entity.isValid()) {
        deadEntities.push(entity);
        deadCallback?.(entity);
      } else {
        newEntityIds.push(entityId);
        callback(entity);
      }
    });

    deadEntities.forEach((deadEntity) => {
      deadEntity.destroy();
    });
    if (this.entityIds.length !== newEntityIds.length) {
      this.entityIds = newEntityIds;
    }
  }

  public removeEntity(entity: EntityType): void {
    const idx = this.entityIds.indexOf(entity.id);
    if (idx === -1) return;

    this.entityIds.splice(idx, 1);
  }
}
