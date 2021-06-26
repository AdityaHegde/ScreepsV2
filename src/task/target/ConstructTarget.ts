import {Target} from "./Target";
import {EventLoop} from "../../events/EventLoop";
import {StructureBuiltEventHandler} from "../../events/StructureBuiltEventHandler";

export class ConstructTarget extends Target<ConstructionSite> {
  public getWeightForCreep(creep: Creep): number {
    return creep.store.getUsedCapacity(RESOURCE_ENERGY);
  }

  public getWeightForTarget(target: ConstructionSite): number {
    return target.progressTotal - target.progress;
  }

  public takeAction(creep: Creep, target: ConstructionSite): number {
    return creep.build(target);
  }

  public getWeightPerAction(creep: Creep): number {
    return creep.memory.power * BUILD_POWER;
  }

  public getInitialTargets(): Array<ConstructionSite> {
    return [];
  }

  public targetLowOnWeight(room: Room, target: ConstructionSite): void {
    EventLoop.getEventLoop().addEvent(StructureBuiltEventHandler.getEvent(
      room.name, target.structureType, target.pos.x, target.pos.y));
  }
}
