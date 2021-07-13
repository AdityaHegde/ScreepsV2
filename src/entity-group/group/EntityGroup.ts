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
  public entityWrappers: Array<EntityWrapperType>;

  public readonly EntityWrapperClass: typeof EntityWrapper;

  protected readonly logger = new Logger("EntityGroup");

  public init(): void {
    // nothing
  }

  public preTick(): void {
    this.entityWrappers = this.entityWrapperIds.map(entityWrapperId =>
      Globals.getGlobal(this.EntityWrapperClass, entityWrapperId,
        () => new this.EntityWrapperClass(entityWrapperId)) as EntityWrapperType);
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

    this.entityWrappers.forEach((entityWrapper) => {
      this.logger.setEntityWrapper(entityWrapper);

      if (!entityWrapper.entity) {
        deadEntityWrappers.push(entityWrapper);
        deadCallback?.(entityWrapper);
      } else {
        callback(entityWrapper);
      }
    });

    deadEntityWrappers.forEach((deadEntityWrapper) => {
      this.removeEntityWrapper(deadEntityWrapper);
      deadEntityWrapper.destroy();
    });
  }

  public removeEntityWrapper(entityWrapper: EntityWrapperType): void {
    const idx = this.entityWrapperIds.indexOf(entityWrapper.id);
    if (idx === -1) return;

    this.entityWrappers.splice(idx, 1);
    this.entityWrapperIds.splice(idx, 1);
  }
}
