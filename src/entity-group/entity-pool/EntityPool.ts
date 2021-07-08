import {ColonyBaseClass} from "../../ColonyBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {BaseEntityType, EntityWrapper} from "@wrappers/EntityWrapper";
import {getWrapperById} from "@wrappers/getWrapperById";
import {findInArray} from "@utils/StatsUtils";

@MemoryClass("entityPool")
export class EntityPool extends ColonyBaseClass {
  @inMemory(() => [])
  public entityWrapperIds: Array<string>;
  @inMemory(() => {return {}})
  public weights: Record<string, number>;

  public freeEntityWrappers: Array<EntityWrapper<BaseEntityType>>;
  public preTickRun = false;

  public preTick(): void {
    if (this.preTickRun) return;
    this.freeEntityWrappers = new Array<EntityWrapper<BaseEntityType>>();
    this.preTickRun = true;

    this.entityWrapperIds.forEach((entityWrapperId) => {
      const entityWrapper = getWrapperById(entityWrapperId);
      // this.logger.log(`id=${entityWrapper.id} ${this.weights[entityWrapper.id]}`);
      if (!entityWrapper.entity) {
        this.removeEntityWrapper(entityWrapper);
      } else if (this.weights[entityWrapper.id] > 0) {
        this.freeEntityWrappers.push(entityWrapper);
      }
    });
  }

  public addEntityWrapper(entityWrapper: EntityWrapper<BaseEntityType>, initialWeight: number): void {
    if (this.entityWrapperIds.indexOf(entityWrapper.id) >= 0) return;
    this.entityWrapperIds.push(entityWrapper.id);
    this.weights[entityWrapper.id] = initialWeight;
    if (this.weights[entityWrapper.id] > 0) {
      this.freeEntityWrappers?.push(entityWrapper);
    }
  }

  public updateCurrentWeight(entityWrapper: EntityWrapper<BaseEntityType>, curWeightOffset: number, maxWeight: number): void {
    const wasNotFree = this.weights[entityWrapper.id] === 0;
    this.weights[entityWrapper.id] = Math.min(
      Math.max(0, this.weights[entityWrapper.id] + curWeightOffset), maxWeight,
    );
    if (wasNotFree) {
      this.freeEntityWrappers.push(entityWrapper);
    }
  }

  public removeEntityWrapper(entityWrapper: EntityWrapper<BaseEntityType>): void {
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

  public claimTarget(entityWrapper: EntityWrapper<BaseEntityType>, entityWeight: number): EntityWrapper<BaseEntityType> {
    const claimedEntityWrapper = this.freeEntityWrappers[0];
    let claimedWeight: number;
    if (this.weights[claimedEntityWrapper.id] > entityWeight) {
      claimedWeight = entityWeight;
    } else {
      claimedWeight = entityWeight - this.weights[claimedEntityWrapper.id];
    }
    this.weights[claimedEntityWrapper.id] -= claimedWeight;

    if (this.weights[claimedEntityWrapper.id] <= 0) {
      this.freeEntityWrappers.splice(0, 1);
    }

    // this.logger.log(`claimedWeight=${claimedWeight} newWeight=${this.weights[claimedEntityWrapper.id]}`);

    return claimedEntityWrapper;
  }
}
