import {EntityGroup} from "@wrappers/group/EntityGroup";
import {BaseEntityType, GameEntity} from "@wrappers/GameEntity";
import {inMemory} from "@memory/inMemory";
import {getWrapperById} from "@wrappers/getWrapperById";
import {JobTarget, JobTargetWeightIdx} from "./JobParams";

export const WeightSizeIdx = 0;
export const WeightCountIdx = 1;

export class WeightedGroup<EntityType extends GameEntity<BaseEntityType> = GameEntity<BaseEntityType>> extends EntityGroup<EntityType> {
  @inMemory(() => [])
  public freeEntityIds: Array<string>;
  @inMemory(() => 0)
  public cursor: number;
  @inMemory(() => {return {}})
  public weights: Record<string, [size: number, count: number]>;

  public shouldRotate: boolean;

  public constructor(id: string, shouldRotate = false) {
    super(id, null);
    this.shouldRotate = shouldRotate;
  }

  public addWeightedEntity(entity: EntityType, initialWeight: number, weightOffset?: number): void {
    if (entity.id in this.weights) {
      this.updateCurrentWeight(entity, weightOffset ?? initialWeight, initialWeight);
      return;
    }

    this.addEntity(entity);
    this.weights[entity.id] = [initialWeight, 0];
    if (initialWeight > 0) {
      this.freeEntityIds.push(entity.id);
    }
  }

  public updateCurrentWeight(entityWrapper: EntityType, curWeightOffset: number, maxWeight: number): void {
    if (!(entityWrapper.id in this.weights)) return;
    const wasNotFree = this.weights[entityWrapper.id][WeightSizeIdx] === 0;
    this.weights[entityWrapper.id][WeightSizeIdx] = Math.min(
      Math.max(0, this.weights[entityWrapper.id][WeightSizeIdx] + curWeightOffset), maxWeight,
    );
    if (wasNotFree) {
      this.freeEntityIds.push(entityWrapper.id);
    }
  }

  public removeEntity(entity: EntityType): void {
    super.removeEntity(entity);

    const freeIdx = this.freeEntityIds.indexOf(entity.id);
    if (freeIdx === -1) return;
    this.freeEntityIds.splice(freeIdx, 1);
  }

  // a single entity has entire weight
  public hasFreeSingleWeight(entityWeight?: number): boolean {
    return this.freeEntityIds.find(freeEntityId => this.weights[freeEntityId][WeightSizeIdx] >= entityWeight) !== undefined;
  }

  // multiple entities add up to weight
  public hasFreeWeight(entityWeight?: number): number {
    for (const freeEntityId of this.freeEntityIds) {
      entityWeight = Math.max(0, entityWeight - this.weights[freeEntityId][WeightSizeIdx]);
      if (entityWeight === 0) break;
    }
    return entityWeight;
  }

  public claimTarget(entityWeight: number, fullClaim = false): JobTarget {
    const claimedEntityIdx = fullClaim ?
      this.freeEntityIds.findIndex(freeEntityId => this.weights[freeEntityId][WeightSizeIdx] >= entityWeight) : 0;
    const claimedEntity = getWrapperById(this.freeEntityIds[claimedEntityIdx]) as EntityType;
    let claimedWeight: number;
    if (this.weights[claimedEntity.id][WeightSizeIdx] >= entityWeight) {
      claimedWeight = entityWeight;
    } else {
      claimedWeight = this.weights[claimedEntity.id][WeightSizeIdx];
    }
    this.weights[claimedEntity.id][WeightSizeIdx] -= claimedWeight;
    this.weights[claimedEntity.id][WeightCountIdx]++;

    if (this.weights[claimedEntity.id][WeightSizeIdx] <= 0) {
      this.freeEntityIds.splice(claimedEntityIdx, 1);
    }
    if (this.shouldRotate) {
      this.cursor = (this.cursor + 1) % this.entityIds.length;
    }

    return [claimedEntity.id, this.id, claimedWeight];
  }

  public claimTargets(entityWeight: number): [Array<JobTarget>, number] {
    const jobTargets = new Array<JobTarget>();

    while (this.freeEntityIds.length > 0 && entityWeight > 0) {
      const jobTarget = this.claimTarget(entityWeight);
      jobTargets.push(jobTarget);
      entityWeight -= jobTarget[JobTargetWeightIdx];
    }

    return [jobTargets, entityWeight];
  }

  public releaseTarget(entityId: string, returnedWeight: number): boolean {
    if (!(entityId in this.weights)) return;

    this.weights[entityId][WeightSizeIdx] = Math.max(0, this.weights[entityId][WeightSizeIdx] + returnedWeight);
    this.weights[entityId][WeightCountIdx] = Math.max(0, this.weights[entityId][WeightCountIdx] - 1);

    return this.weights[entityId][WeightSizeIdx] <= 0 && this.weights[entityId][WeightCountIdx] <= 0;
  }
}
