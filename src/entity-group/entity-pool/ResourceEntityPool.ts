import {EntityPool} from "./EntityPool";
import {inMemory} from "@memory/inMemory";
import {getWrapperById} from "@wrappers/getWrapperById";
import {ResourceWrapper} from "@wrappers/ResourceWrapper";
import {Globals} from "@globals/Globals";
import {RESOURCE_FIND_THRESHOLD} from "../../constants";

export type FutureEntity = [tick: number, wrapperId: string];
export const FutureEntityTickIdx = 0;
export const FutureEntityWrapperIdx = 1;

export class ResourceEntityPool extends EntityPool {
  @inMemory(() => [])
  public futureEntities: Array<FutureEntity>;

  public preTick(): void {
    if (this.preTickRun) return;

    this.futureEntities = this.futureEntities.filter((futureEntity) => {
      if (Game.time < futureEntity[FutureEntityTickIdx]) return true;

      const resourceWrapper = Globals.getGlobal<ResourceWrapper>(
        ResourceWrapper as any, futureEntity[FutureEntityWrapperIdx],
        () => new ResourceWrapper(futureEntity[FutureEntityWrapperIdx]),
      );

      if (resourceWrapper.findAndUpdateResource(this.room)) {
        return false;
      }

      // if resource is not found within a fixed time, remove it
      if (Game.time >= futureEntity[FutureEntityTickIdx] + RESOURCE_FIND_THRESHOLD) {
        resourceWrapper.hasExpired = true;
        this.removeEntityWrapper(resourceWrapper);
      }

      return true;
    });

    super.preTick();
  }

  public addResource(tick: number, x: number, y: number, type: string, weight: number): void {
    const resourceWrapperId = ResourceWrapper.getId(this.room, x, y, type);
    let resourceWrapper: ResourceWrapper;

    const resources = this.room.lookForAt(LOOK_RESOURCES, x, y);
    for (const resource of resources) {
      if (resource.resourceType === type) {
        resourceWrapper = getWrapperById(resourceWrapperId) as ResourceWrapper;
        this.updateCurrentWeight(resourceWrapper, weight, resource.amount + weight);
        break;
      }
    }

    if (!resourceWrapper) {
      resourceWrapper = new ResourceWrapper(resourceWrapperId).setInfo([x, y], this.room.name);
      this.addEntityWrapper(resourceWrapper, weight);
    }
    if (!resourceWrapper.entity) {
      this.futureEntities.push([tick, resourceWrapperId]);
    }
  }
}
