import {ColonyBaseClass} from "../../ColonyBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {BaseEntityType, EntityWrapper} from "@wrappers/EntityWrapper";
import {getWrapperById} from "@wrappers/getWrapperById";

@MemoryClass("entityPool")
export class EntityPool extends ColonyBaseClass {
  @inMemory(() => [])
  public entityWrapperIds: Array<string>;
  @inMemory(() => {return {}})
  public weights: Record<string, number>;
  @inMemory(() => {return {}})
  public currentWeights: Record<string, number>;

  public freeEntityWrappers: Array<EntityWrapper<any>>;

  public preTick(): void {
    this.freeEntityWrappers = new Array<EntityWrapper<any>>();
    this.entityWrapperIds.forEach((entityWrapperId) => {
      const entityWrapper = getWrapperById(entityWrapperId);
      if (this.currentWeights[entityWrapper.id] > 0) {
        this.freeEntityWrappers.push(entityWrapper);
      }
    });
  }

  public addEntityWrapper(entityWrapper: EntityWrapper<any>): void {
    this.entityWrapperIds.push(entityWrapper.id);
    this.currentWeights[entityWrapper.id] = entityWrapper.weight;
    if (this.currentWeights[entityWrapper.id] > 0) {
      this.freeEntityWrappers.push(entityWrapper);
    }
  }

  public removeEntityWrapper(entityWrapper: EntityWrapper<any>): void {
    const idx = this.entityWrapperIds.indexOf(entityWrapper.id);
    if (idx === -1) return;
    this.entityWrapperIds.splice(idx, 1);

    const freeIdx = this.freeEntityWrappers.indexOf(entityWrapper);
    if (freeIdx === -1) return;
    this.freeEntityWrappers.splice(freeIdx, 1);
  }

  public hasFreeEntityWrapper(): boolean {
    return this.freeEntityWrappers.length > 0;
  }

  public claimTarget(entityWrapper: EntityWrapper<any>): EntityWrapper<BaseEntityType> {
    const claimedEntityWrapper = this.freeEntityWrappers[0];
    if (this.currentWeights[claimedEntityWrapper.id] > entityWrapper.weight) {
      entityWrapper.currentWeight = this.currentWeights[claimedEntityWrapper.id] - entityWrapper.weight;
    } else {
      entityWrapper.currentWeight = this.currentWeights[claimedEntityWrapper.id];
    }
    this.currentWeights[claimedEntityWrapper.id] -= entityWrapper.currentWeight;

    if (this.currentWeights[claimedEntityWrapper.id] <= 0) {
      this.freeEntityWrappers.splice(0, 1);
    }

    return claimedEntityWrapper as EntityWrapper<BaseEntityType>;
  }
}
