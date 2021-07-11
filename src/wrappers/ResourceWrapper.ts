import {EntityWrapper} from "@wrappers/EntityWrapper";
import {inMemory} from "@memory/inMemory";
import {ArrayPos} from "../preprocessing/Prefab";

export class ResourceWrapper extends EntityWrapper<Resource> {
  @inMemory()
  public entityId: string;

  @inMemory()
  public arrayPos: ArrayPos;

  @inMemory()
  public hasExpired: boolean;

  public isValid(): boolean {
    return !this.hasExpired;
  }

  public setArrayPos(arrayPos: ArrayPos): this {
    this.arrayPos = arrayPos;
    return this;
  }

  public updateEntity(entity: Resource): this {
    this.entity = entity;
    this.entityId = entity.id;
    return this;
  }

  public findAndUpdateResource(room: Room): boolean {
    const resources = room.lookForAt(LOOK_RESOURCES, this.arrayPos[0], this.arrayPos[1]);
    for (const resource of resources) {
      if (ResourceWrapper.getId(room, this.arrayPos[0], this.arrayPos[1], resource.resourceType) === this.id) {
        this.updateEntity(resource);
        return true;
      }
    }

    return false;
  }

  public static getId(room: Room, x: number, y: number, type: string): string {
    return `${room.name}-${x}-${y}-${type}`;
  }

  protected getEntityById(): Resource {
    return this.entityId ? Game.getObjectById(this.entityId) : null;
  }
}
