import {ColonyBaseClass} from "../../../ColonyBaseClass";
import {EntityPool} from "../../entity-pool/EntityPool";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {Logger} from "@utils/Logger";
import {JobParams} from "./JobParams";

export class JobNetwork extends ColonyBaseClass {
  public sourcesEntityPoolId: string;
  public sourcesEntityPool: EntityPool;
  public targetsEntityPoolId: string;
  public targetsEntityPool: EntityPool;
  public targetWeightMultiplier: number;
  public resource: ResourceConstant;

  protected logger = new Logger("JobNetwork");

  public constructor(
    id: string, room: Room,
    sourcesEntityPool: EntityPool, targetsEntityPool: EntityPool,
    targetWeightMultiplier: number, resource: ResourceConstant,
  ) {
    super(id, room);
    this.sourcesEntityPoolId = sourcesEntityPool.id;
    this.sourcesEntityPool = sourcesEntityPool;
    this.targetsEntityPoolId = targetsEntityPool.id;
    this.targetsEntityPool = targetsEntityPool;
    this.targetWeightMultiplier = targetWeightMultiplier;
    this.resource = resource;
  }

  public preTick(): void {
    // this.sourcesEntityPool = Globals.getGlobal<EntityPool>(EntityPool as any, this.sourcesEntityPoolId);
    this.sourcesEntityPool.preTick();
    // this.targetsEntityPool = Globals.getGlobal<EntityPool>(EntityPool as any, this.targetsEntityPoolId);
    this.targetsEntityPool.preTick();
  }

  public hasFreeJob(sourceWeight: number): boolean {
    return this.sourcesEntityPool.hasFreeEntityWrapper(sourceWeight) &&
      this.targetsEntityPool.hasFreeEntityWrapper();
  }

  public claimJob(creepWrapper: CreepWrapper, sourceWeight: number, targetWeight: number): JobParams {
    const sourceEntityWrapper = this.sourcesEntityPool.claimTarget(creepWrapper, sourceWeight, true);
    const targetEntityWrapper = this.targetsEntityPool.claimTarget(creepWrapper, targetWeight);
    return [
      this.resource,
      sourceEntityWrapper.id, this.sourcesEntityPoolId,
      targetEntityWrapper.id, this.targetsEntityPoolId,
    ];
  }
}
