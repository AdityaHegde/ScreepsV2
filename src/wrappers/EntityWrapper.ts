import {BaseClass} from "../BaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {Globals} from "@globals/Globals";
import {ArrayPos} from "../preprocessing/Prefab";

export interface BaseEntityType {
  id: string;
  pos: RoomPosition;
}
export interface StoreEntityType extends BaseEntityType {
  store: Store<any, any>;
}

@MemoryClass("entity")
export class EntityWrapper<EntityType extends BaseEntityType> extends BaseClass {
  public entity: EntityType;

  @inMemory()
  public target: string;
  public targetEntity: BaseEntityType;
  @inMemory()
  public weight: number;
  @inMemory()
  public currentWeight: number;

  @inMemory()
  public task: number;
  @inMemory()
  public subTask: number;

  public arrayPos: ArrayPos;

  public constructor(id: string) {
    super(id);
    this.entity = this.getEntityById(id);
    if (this.entity) {
      this.arrayPos = [this.entity.pos.x, this.entity.pos.y];
    }
  }

  public isValid(): boolean {
    return !!this.entity;
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
