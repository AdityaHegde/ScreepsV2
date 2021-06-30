import {ColonyBaseClass} from "../ColonyBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {EntityWrapper} from "../wrappers/EntityWrapper";
import {inMemory} from "@memory/inMemory";
import {Globals} from "../globals/Globals";
import {CreepWrapper} from "../wrappers/CreepWrapper";

@MemoryClass("groups")
export class EntityGroup<EntityWrapperType extends EntityWrapper<any>> extends ColonyBaseClass {
  @inMemory(() => [])
  public entityWrapperIds: Array<string>;
  public entityWrappers: Array<EntityWrapperType>;

  public readonly EntityWrapperClass: typeof EntityWrapper;

  public init(): void {
    // nothing
  }

  public preTick(): void {
    // nothing
  }

  public tick(): void {
    // nothing
  }

  public postTick(): void {
    // nothing
  }

  public addEntityWrapper(entityWrapper: EntityWrapperType): void {
    entityWrapper.task = 0;
    entityWrapper.subTask = 0;
    this.entityWrappers.push(entityWrapper);
    this.entityWrapperIds.push(entityWrapper.id);
  }

  public forEachEntityWrapper(
    callback: (entityWrapper: EntityWrapperType) => void,
    deadCallback?: (entityWrapper: EntityWrapperType) => void,
  ): void {
    const deadEntityWrappers = new Array<EntityWrapperType>();

    this.entityWrapperIds.forEach((entityWrapperId, entityWrapperIdx) => {
      if (this.entityWrappers.length < entityWrapperIdx) {
        this.entityWrappers.push(Globals.getGlobal(this.EntityWrapperClass, entityWrapperId,
          () => new this.EntityWrapperClass(entityWrapperId)) as EntityWrapperType);
      }

      const entityWrapper = this.entityWrappers[entityWrapperIdx];

      if (!entityWrapper.entity) {
        entityWrapper.destroy();
        deadEntityWrappers.push(entityWrapper);
        deadCallback?.(entityWrapper);
      } else {
        callback(entityWrapper);
      }
    });

    deadEntityWrappers.forEach(deadEntityWrapper => this.removeEntityWrapper(deadEntityWrapper));
  }

  public removeEntityWrapper(entityWrapper: EntityWrapperType): void {
    const idx = this.entityWrapperIds.indexOf(entityWrapper.id);
    if (idx === -1) return;

    this.entityWrappers.splice(idx, 1);
    this.entityWrapperIds.splice(idx, 1);
  }
}
