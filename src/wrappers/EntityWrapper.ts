import {BaseClass} from "../BaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {Globals} from "../globals/Globals";

export interface BaseEntityType {
  id: string;
}
export interface BasePosEntityType extends BaseEntityType {
  pos: RoomPosition;
}

@MemoryClass("entity")
export class EntityWrapper<EntityType extends BaseEntityType> extends BaseClass {
  public entity: EntityType;

  @inMemory()
  public target: string;
  public targetEntity: BasePosEntityType;
  @inMemory()
  public weight: number;

  @inMemory()
  public task: number;
  @inMemory()
  public subTask: number;

  public constructor(id: string) {
    super(id);
    this.entity = this.getEntityById(id);
  }

  public updateEntity(entity: EntityType): this {
    this.entity = entity;
    return this;
  }

  public static getEntityWrapper<EntityWrapperType extends EntityWrapper<any>>(id: string): EntityWrapperType {
    return Globals.getGlobal<EntityWrapperType>(this, id, (() => new this(id)) as any);
  }

  protected getEntityById(id: string): EntityType {
    return Game.getObjectById(id);
  }
}
