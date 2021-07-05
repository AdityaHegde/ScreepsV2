import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {Globals} from "@globals/Globals";
import {ColonyBaseClass} from "../../ColonyBaseClass";
import {EntityWrapper} from "@wrappers/EntityWrapper";
import {GROUPS_MEMORY_NAME} from "../../constants";
import {Logger} from "@utils/Logger";

@MemoryClass(GROUPS_MEMORY_NAME)
export class EntityGroup<EntityWrapperType extends EntityWrapper<any>> extends ColonyBaseClass {
  @inMemory(() => [])
  public entityWrapperIds: Array<string>;
  public entityWrappers = new Array<EntityWrapperType>();

  public readonly EntityWrapperClass: typeof EntityWrapper;

  protected readonly logger = new Logger("EntityGroup");

  public init(): void {
    // nothing
  }

  public preTick(): void {
    this.forEachEntityWrapper(() => {
      // nothing
    });
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
