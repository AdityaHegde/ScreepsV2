import {ColonyBaseClass} from "../../ColonyBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {BaseEntityType, EntityWrapper} from "@wrappers/EntityWrapper";
import {getWrapperById} from "@wrappers/getWrapperById";
import {findInArray} from "@utils/StatsUtils";
import inlineDiffs = Mocha.reporters.Base.inlineDiffs;

@MemoryClass("entityPool")
export class EntityPool extends ColonyBaseClass {
  @inMemory(() => [])
  public entityWrapperIds: Array<string>;
  @inMemory(() => 0)
  public cursor: number;
  @inMemory(() => {return {}})
  public weights: Record<string, number>;

  public shouldRotate: boolean;

  public freeEntityWrappers: Array<EntityWrapper<BaseEntityType>>;
  public preTickRun = false;

  public constructor(id: string, room: Room, shouldRotate = false) {
    super(id, room);
    this.shouldRotate = shouldRotate;
  }

  public preTick(): void {
    if (this.preTickRun) return;
    this.freeEntityWrappers = new Array<EntityWrapper<BaseEntityType>>();
    this.preTickRun = true;

    for (
      let c = 0, i = this.cursor % this.entityWrapperIds.length;
      c < this.entityWrapperIds.length;
      c++, i = (i + 1) % this.entityWrapperIds.length
    ) {
      const entityWrapper = getWrapperById(this.entityWrapperIds[i]);
      if (!entityWrapper.isValid()) {
        this.removeEntityWrapper(entityWrapper);
      } else if (this.weights[entityWrapper.id] > 0) {
        this.freeEntityWrappers.push(entityWrapper);
      }
    }
  }

  public addEntityWrapper(entityWrapper: EntityWrapper<BaseEntityType>, initialWeight: number, weightOffset?: number): void {
    if (this.entityWrapperIds.indexOf(entityWrapper.id) >= 0) {
      this.updateCurrentWeight(entityWrapper, weightOffset ?? initialWeight, initialWeight);
      return;
    }

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

    if (!this.freeEntityWrappers) return;
    const freeIdx = this.freeEntityWrappers.indexOf(entityWrapper);
    if (freeIdx === -1) return;
    this.freeEntityWrappers.splice(freeIdx, 1);
  }

  public hasFreeEntityWrapper(entityWeight?: number): boolean {
    if (entityWeight) {
      return this.freeEntityWrappers.find(freeEntityWrapper => this.weights[freeEntityWrapper.id] >= entityWeight) !== undefined;
    } else {
      return this.freeEntityWrappers.length > 0;
    }
  }

  public claimTarget(entityWrapper: EntityWrapper<BaseEntityType>, entityWeight: number, fullClaim = false): EntityWrapper<BaseEntityType> {
    const claimedEntityWrapperIdx = fullClaim ?
      this.freeEntityWrappers.findIndex(freeEntityWrapper => this.weights[freeEntityWrapper.id] >= entityWeight) : 0;
    const claimedEntityWrapper = this.freeEntityWrappers[claimedEntityWrapperIdx];
    let claimedWeight: number;
    if (this.weights[claimedEntityWrapper.id] >= entityWeight) {
      claimedWeight = entityWeight;
    } else {
      claimedWeight = entityWeight - this.weights[claimedEntityWrapper.id];
    }
    this.weights[claimedEntityWrapper.id] -= claimedWeight;

    if (this.weights[claimedEntityWrapper.id] <= 0) {
      this.freeEntityWrappers.splice(claimedEntityWrapperIdx, 1);
    }
    if (this.shouldRotate) {
      this.cursor = (this.cursor + 1) % this.entityWrapperIds.length;
    }

    return claimedEntityWrapper;
  }
}
