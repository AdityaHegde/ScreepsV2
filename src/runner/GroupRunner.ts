import {ColonyBaseClass} from "../ColonyBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {CreepSpawnQueue} from "../wrappers/creeps-spawner/CreepSpawnQueue";
import {Entity} from "@wrappers/Entity";
import {CreepsSpawner} from "@wrappers/creeps-spawner/CreepsSpawner";

@MemoryClass("groupRunner")
export class GroupRunner extends ColonyBaseClass {
  public entities: Array<Entity>;
  public creepSpawnQueue: CreepSpawnQueue;

  public constructor(
    id: string, room: Room,
    groups: Array<Entity>, creepSpawnQueue: CreepSpawnQueue,
  ) {
    super(id, room);
    this.entities = groups;
    this.creepSpawnQueue = creepSpawnQueue;
  }

  public init(): void {
    [0, 2, 1, 2, 0, 2, 1, 2, 3, 3].forEach(groupIdx =>
      this.creepSpawnQueue.addToQueue(((this.entities[groupIdx] as any).creepSpawner as CreepsSpawner).getSpawnQueueEntry()));
  }

  public preTick(): void {
    // nothing
  }

  public tick(): void {
    this.entities.forEach(group => group.run());
  }

  public postTick(): void {
    this.entities.forEach((entity) => {
      if ((entity as any).creepSpawner) {
        this.handleCreepSpawner(entity);
      }
    });
  }

  private handleCreepSpawner(entity: Entity) {
    const creepSpawner = ((entity as any).creepSpawner as CreepsSpawner);
    if (!this.creepSpawnQueue?.hasSpaceForCreep(entity.id)) return;

    creepSpawner.updateBodyParts();
    if (entity.shouldSpawnCreep()) {
      this.creepSpawnQueue.addToQueue(creepSpawner.getSpawnQueueEntry());
    }
  }
}
