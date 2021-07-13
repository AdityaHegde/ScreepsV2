import {ColonyBaseClass} from "../ColonyBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {EntityGroup} from "../entity-group/group/EntityGroup";
import {CreepGroup} from "../entity-group/group/CreepGroup";
import {CreepSpawnQueue} from "../entity-group/creeps-manager/CreepSpawnQueue";

@MemoryClass("groupRunner")
export class GroupRunner extends ColonyBaseClass {
  public groups: Array<EntityGroup<any>>;
  public creepSpawnQueue: CreepSpawnQueue;

  public constructor(
    id: string, room: Room,
    groups: Array<EntityGroup<any>>, creepSpawnQueue: CreepSpawnQueue,
  ) {
    super(id, room);
    this.groups = groups;
    this.creepSpawnQueue = creepSpawnQueue;
  }

  public init(): void {
    this.groups.forEach(group => group.init());
    [0, 1, 2, 1, 0, 1, 2, 1, 3, 3].forEach(groupIdx =>
      this.creepSpawnQueue.addToQueue((this.groups[groupIdx] as CreepGroup).creepSpawner.getSpawnQueueEntry()));
  }

  public preTick(): void {
    this.groups.forEach((group) => {
      group.preTick();
      if (group instanceof CreepGroup) {
        this.handleCreepSpawner(group);
      }
    });
  }

  public tick(): void {
    this.groups.forEach(group => group.tick());
  }

  public postTick(): void {
    this.groups.forEach(group => group.postTick());
  }

  private handleCreepSpawner(group: CreepGroup) {
    group.creepSpawner.updateBodyParts();

    if (!this.creepSpawnQueue?.hasSpaceForCreep(group.id)) return;

    if (group.creepSpawner.shouldSpawnCreeps()) {
      this.creepSpawnQueue.addToQueue(group.creepSpawner.getSpawnQueueEntry());
    }
  }
}
