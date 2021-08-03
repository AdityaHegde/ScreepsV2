import {BaseClass} from "../BaseClass";
import {inMemory} from "@memory/inMemory";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {Globals} from "@globals/Globals";
import {MemoryClass} from "@memory/MemoryClass";
import {ENTITY_MEMORY_NAME} from "../constants";

@MemoryClass(ENTITY_MEMORY_NAME)
export class Entity extends BaseClass {
  @inMemory()
  public weight: number;
  @inMemory()
  public targetWeight: number;

  public isValid(): boolean {
    return true;
  }

  public run(): void {
    // to implement
  }

  public jobSource(creepWrapper: CreepWrapper): number {
    // to implement
    return OK;
  }

  public jobTarget(creepWrapper: CreepWrapper): number {
    // to implement
    return OK;
  }

  public addEntity(entity: Entity): void {
    // to implement
  }

  public shouldSpawnCreep(): boolean {
    // to implement
    return false;
  }

  public static getEntityWrapper<EntityWrapperType extends Entity>(id: string): EntityWrapperType {
    return Globals.getGlobal<EntityWrapperType>(this, id, (() => new this(id)) as any);
  }
}
