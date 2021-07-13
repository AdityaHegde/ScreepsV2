import {EntityWrapper} from "@wrappers/EntityWrapper";
import {inMemory} from "@memory/inMemory";
import {ArrayPos} from "../preprocessing/Prefab";

export class ResourceWrapper extends EntityWrapper<Resource> {
  @inMemory()
  public entityId: string;

  @inMemory()
  public arrayPos: ArrayPos;
  @inMemory()
  public roomName: string;

  @inMemory()
  public hasExpired: boolean;

  public constructor(id: string) {
    super(id);
    if (!this.entity && this.arrayPos) {
      this.roomPos = new RoomPosition(this.arrayPos[0], this.arrayPos[1], this.roomName);
    }
  }

  public isValid(): boolean {
    return !this.hasExpired;
  }

  public setInfo(arrayPos: ArrayPos, roomName: string): this {
    this.arrayPos = arrayPos;
    this.roomName = roomName;
    return this;
  }

  public updateEntity(entity: Resource): this {
    this.entityId = entity?.id;
    return super.updateEntity(entity);
  }

  public findAndUpdateResource(room: Room): boolean {
    if (!this.arrayPos) return false;

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
