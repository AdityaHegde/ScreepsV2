import {ColonyBaseClass} from "../../../ColonyBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {EntityPool} from "../../entity-pool/EntityPool";
import {Globals} from "@globals/Globals";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {HaulJobParams} from "./HaulJob";

@MemoryClass("haulNetwork")
export class HaulNetwork extends ColonyBaseClass {
  @inMemory()
  public sourcesEntityPoolId: string;
  public sourcesEntityPool: EntityPool;
  @inMemory()
  public targetsEntityPoolId: string;
  public targetsEntityPool: EntityPool;
  public resource: ResourceConstant;
  public pathFinder: ColonyPathFinder;

  public constructor(
    id: string, room: Room,
    sourcesEntityPool: EntityPool, targetsEntityPool: EntityPool,
    resource: ResourceConstant,
  ) {
    super(id, room);
    this.sourcesEntityPoolId = sourcesEntityPool.id;
    this.targetsEntityPoolId = targetsEntityPool.id;
    this.resource = resource;
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

  public claimJob(creepWrapper: CreepWrapper): HaulJobParams {
    const sourceEntityWrapper = this.sourcesEntityPool.claimTarget(creepWrapper);
    const targetEntityWrapper = this.targetsEntityPool.claimTarget(creepWrapper);
    return [
      this.pathFinder.acquireRoadPos(sourceEntityWrapper.entity.pos), sourceEntityWrapper.id,
      this.pathFinder.acquireRoadPos(targetEntityWrapper.entity.pos), targetEntityWrapper.id,
      this.resource,
    ];
  }
}
