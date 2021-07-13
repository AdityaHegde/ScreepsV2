import {ColonyBaseClass} from "../../ColonyBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {BaseEntityType, EntityWrapper} from "@wrappers/EntityWrapper";
import {getWrapperById} from "@wrappers/getWrapperById";
import {findInArray} from "@utils/StatsUtils";
import inlineDiffs = Mocha.reporters.Base.inlineDiffs;
import {EventLoop} from "../../events/EventLoop";
import {StructureBuiltEventHandler} from "../../events/StructureBuiltEventHandler";

export const WeightSizeIdx = 0;
export const WeightCountIdx = 1;

@MemoryClass("entityPool")
export class EntityPool extends ColonyBaseClass {
  @inMemory(() => [])
  public entityWrapperIds: Array<string>;
  @inMemory(() => 0)
  public cursor: number;
  @inMemory(() => {return {}})
  public weights: Record<string, [size: number, count: number]>;

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
        entityWrapper.destroy();
      } else if (this.weights[entityWrapper.id][WeightSizeIdx] > 0) {
        this.freeEntityWrappers.push(entityWrapper);
      }
    }
  }

  public addEntityWrapper(entityWrapper: EntityWrapper<BaseEntityType>, initialWeight: number, weightOffset?: number): void {
    if (entityWrapper.id in this.weights) {
      this.updateCurrentWeight(entityWrapper, weightOffset ?? initialWeight, initialWeight);
      return;
    }

    this.entityWrapperIds.push(entityWrapper.id);
    this.weights[entityWrapper.id] = [initialWeight, 0];
    if (initialWeight > 0) {
      this.freeEntityWrappers?.push(entityWrapper);
    }
  }

  public updateCurrentWeight(entityWrapper: EntityWrapper<BaseEntityType>, curWeightOffset: number, maxWeight: number): void {
    if (!(entityWrapper.id in this.weights)) return;
    const wasNotFree = this.weights[entityWrapper.id][WeightSizeIdx] === 0;
    this.weights[entityWrapper.id][WeightSizeIdx] = Math.min(
      Math.max(0, this.weights[entityWrapper.id][WeightSizeIdx] + curWeightOffset), maxWeight,
    );
    if (wasNotFree) {
      this.freeEntityWrappers.push(entityWrapper);
    }
  }

  public removeEntityWrapper(entityWrapper: EntityWrapper<BaseEntityType>): void {
    this.logger.log(`entityPool=${this.id} Removing id=${entityWrapper.id} ` +
      `weight=${this.weights[entityWrapper.id]?.[WeightSizeIdx]} ` +
      `claimCount=${this.weights[entityWrapper.id]?.[WeightCountIdx]}`);
    const idx = this.entityWrapperIds.indexOf(entityWrapper.id);
    if (idx === -1) return;
    this.entityWrapperIds.splice(idx, 1);
    delete this.weights[entityWrapper.id];

    if (!this.freeEntityWrappers) return;
    const freeIdx = this.freeEntityWrappers.indexOf(entityWrapper);
    if (freeIdx === -1) return;
    this.freeEntityWrappers.splice(freeIdx, 1);
  }

  public hasFreeEntityWrapper(entityWeight?: number): boolean {
    if (entityWeight) {
      return this.freeEntityWrappers.find(freeEntityWrapper => this.weights[freeEntityWrapper.id][WeightSizeIdx] >= entityWeight) !== undefined;
    } else {
      return this.freeEntityWrappers.length > 0;
    }
  }

  public claimTarget(entityWrapper: EntityWrapper<BaseEntityType>, entityWeight: number, fullClaim = false): EntityWrapper<BaseEntityType> {
    const claimedEntityWrapperIdx = fullClaim ?
      this.freeEntityWrappers.findIndex(freeEntityWrapper => this.weights[freeEntityWrapper.id][WeightSizeIdx] >= entityWeight) : 0;
    const claimedEntityWrapper = this.freeEntityWrappers[claimedEntityWrapperIdx];
    let claimedWeight: number;
    if (this.weights[claimedEntityWrapper.id][WeightSizeIdx] >= entityWeight) {
      claimedWeight = entityWeight;
    } else {
      claimedWeight = this.weights[claimedEntityWrapper.id][WeightSizeIdx];
    }
    this.weights[claimedEntityWrapper.id][WeightSizeIdx] -= claimedWeight;
    this.weights[claimedEntityWrapper.id][WeightCountIdx]++;
    entityWrapper.targetWeight = claimedWeight;

    if (this.weights[claimedEntityWrapper.id][WeightSizeIdx] <= 0) {
      this.freeEntityWrappers.splice(claimedEntityWrapperIdx, 1);
    }
    if (this.shouldRotate) {
      this.cursor = (this.cursor + 1) % this.entityWrapperIds.length;
    }

    return claimedEntityWrapper;
  }

  public releaseTarget(entityWrapperId: string, returnedWeight: number): boolean {
    if (!(entityWrapperId in this.weights)) return;

    this.logger.log(`ReleaseTarget id=${entityWrapperId} returnedWeight=${returnedWeight} ` +
      `weight=${this.weights[entityWrapperId][WeightSizeIdx]} ` +
      `claimCount=${this.weights[entityWrapperId][WeightCountIdx]}`);

    this.weights[entityWrapperId][WeightSizeIdx] = Math.max(0, this.weights[entityWrapperId][WeightSizeIdx] + returnedWeight);
    this.weights[entityWrapperId][WeightCountIdx] = Math.max(0, this.weights[entityWrapperId][WeightCountIdx] - 1);

    return this.weights[entityWrapperId][WeightSizeIdx] <= 0 && this.weights[entityWrapperId][WeightCountIdx] <= 0;
  }
}
