import {ColonyBaseClass} from "../../ColonyBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {EntityPool} from "../entity-pool/EntityPool";
import {Globals} from "@globals/Globals";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {Logger} from "@utils/Logger";
import {RoadPos} from "../../preprocessing/Prefab";

export type JobParams = [
  source: RoadPos, sourceId: string, sourceEntityPoolId: string,
  target: RoadPos, targetId: string, targetEntityPoolId: string,
  resourceType: ResourceConstant,
];
export const JobSourcePosIdx = 0;
export const JobSourceIdIdx = 1;
export const JobSourceEntityPoolId = 2;
export const JobTargetPosIdx = 3;
export const JobTargetIdIdx = 4;
export const JobTargetEntityPoolId = 5;
export const JobResourceTypeIdx = 6;

@MemoryClass("jobNetwork")
export class JobNetwork extends ColonyBaseClass {
  @inMemory()
  public sourcesEntityPoolId: string;
  public sourcesEntityPool: EntityPool;
  @inMemory()
  public targetsEntityPoolId: string;
  public targetsEntityPool: EntityPool;
  public targetWeightMultiplier: number;
  public resource: ResourceConstant;
  public pathFinder: ColonyPathFinder;

  protected logger = new Logger("JobNetwork");

  public constructor(
    id: string, room: Room,
    sourcesEntityPool: EntityPool, targetsEntityPool: EntityPool,
    targetWeightMultiplier: number, resource: ResourceConstant,
    pathFinder: ColonyPathFinder,
  ) {
    super(id, room);
    this.sourcesEntityPoolId = sourcesEntityPool.id;
    this.targetsEntityPoolId = targetsEntityPool.id;
    this.targetWeightMultiplier = targetWeightMultiplier;
    this.resource = resource;
    this.pathFinder = pathFinder;
  }

  public preTick(): void {
    this.sourcesEntityPool = Globals.getGlobal<EntityPool>(EntityPool as any, this.sourcesEntityPoolId);
    this.sourcesEntityPool.preTick();
    this.targetsEntityPool = Globals.getGlobal<EntityPool>(EntityPool as any, this.targetsEntityPoolId);
    this.targetsEntityPool.preTick();
  }

  public hasFreeJob(): boolean {
    return this.sourcesEntityPool.hasFreeEntityWrapper() && this.targetsEntityPool.hasFreeEntityWrapper();
  }

  public claimJob(creepWrapper: CreepWrapper, sourceWeight: number, targetWeight: number): JobParams {
    const sourceEntityWrapper = this.sourcesEntityPool.claimTarget(creepWrapper, sourceWeight);
    const targetEntityWrapper = this.targetsEntityPool.claimTarget(creepWrapper, targetWeight * this.targetWeightMultiplier);
    this.logger.log(`creep=${creepWrapper.entity.name} claiming, ` +
      `source=${sourceEntityWrapper.id} sourcePos=${sourceEntityWrapper.entity.pos.x},${sourceEntityWrapper.entity.pos.y} ` +
      `target=${targetEntityWrapper.id} targetPos=${targetEntityWrapper.entity.pos.x},${targetEntityWrapper.entity.pos.y} `)
    return [
      this.pathFinder.acquireRoadPos(sourceEntityWrapper.entity.pos), sourceEntityWrapper.id, this.sourcesEntityPoolId,
      this.pathFinder.acquireRoadPos(targetEntityWrapper.entity.pos), targetEntityWrapper.id, this.targetsEntityPoolId,
      this.resource,
    ];
  }
}
