import {BaseClass} from "../BaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {Globals} from "@globals/Globals";
import {ArrayPos} from "../preprocessing/Prefab";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {JobResourceIdx} from "../entity-group/group/job/JobParams";

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
  public weight: number;
  @inMemory()
  public targetWeight: number;

  @inMemory()
  public task: number;
  @inMemory()
  public subTask: number;

  public arrayPos: ArrayPos;
  public roomPos: RoomPosition;

  public constructor(id: string) {
    super(id);
    this.updateEntity(this.getEntityById(id));
  }

  public isValid(): boolean {
    return !!this.entity;
  }

  public updateEntity(entity: EntityType): this {
    this.entity = entity;
    if (this.entity) {
      this.arrayPos = [this.entity.pos.x, this.entity.pos.y];
      this.roomPos = this.entity.pos;
    }
    return this;
  }

  public jobSource(creepWrapper: CreepWrapper): void {
    creepWrapper.entity.withdraw(this.entity as any, creepWrapper.job[JobResourceIdx]);
  }

  public jobTarget(creepWrapper: CreepWrapper): void {
    creepWrapper.entity.transfer(this.entity as any, creepWrapper.job[JobResourceIdx]);
  }

  public static getEntityWrapper<EntityWrapperType extends EntityWrapper<BaseEntityType>>(id: string): EntityWrapperType {
    return Globals.getGlobal<EntityWrapperType>(this, id, (() => new this(id)) as any);
  }

  protected getEntityById(id: string): EntityType {
    return Game.getObjectById(id);
  }
}
