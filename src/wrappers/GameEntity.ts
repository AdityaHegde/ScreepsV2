import {inMemory} from "@memory/inMemory";
import {ArrayPos} from "../preprocessing/Prefab";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {JobResourceIdx} from "./group/JobParams";
import {Entity} from "@wrappers/Entity";

export interface BaseEntityType {
  id: string;
  pos: RoomPosition;
}
export interface StoreEntityType extends BaseEntityType {
  store: Store<any, any>;
}

export class GameEntity<EntityType extends BaseEntityType> extends Entity {
  public entity: EntityType;

  @inMemory()
  public state: number;
  @inMemory()
  public subState: number;

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

  public jobSource(creepWrapper: CreepWrapper): number {
    return creepWrapper.entity.withdraw(this.entity as any, creepWrapper.job[JobResourceIdx]);
  }

  public jobTarget(creepWrapper: CreepWrapper): number {
    const returnValue = creepWrapper.entity.transfer(this.entity as any, creepWrapper.job[JobResourceIdx]);
    if (returnValue === OK) {
      creepWrapper.targetWeight = 0;
      creepWrapper.weight = 0;
    }
    return returnValue;
  }

  protected getEntityById(id: string): EntityType {
    return Game.getObjectById(id);
  }
}
