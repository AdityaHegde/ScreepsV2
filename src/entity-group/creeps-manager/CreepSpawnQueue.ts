import {ColonyBaseClass} from "../../ColonyBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {Globals} from "../../globals/Globals";
import {CreepsSpawner} from "./CreepsSpawner";
import {MAX_QUEUE_SIZE_PER_GROUP} from "../../constants";
import {Logger} from "@utils/Logger";
import {CreepGroup} from "../group/CreepGroup";
import {EventLoop} from "../../events/EventLoop";
import {CreepCreatedEventHandler} from "../../events/CreepCreatedEventHandler";

export type CreepSpawnQueueEntry = [groupId: string, cost: number, mainPartCount: number];

@MemoryClass("creepSpawn")
export class CreepSpawnQueue extends ColonyBaseClass {
  @inMemory(() => [])
  public queue: Array<CreepSpawnQueueEntry>;

  @inMemory()
  public spawnIds: Array<string>;

  public countById = new Map<string, number>();

  protected logger = new Logger("CreepSpawnQueue");

  public init(): void {
    const spawns = this.room.find(FIND_MY_SPAWNS);
    this.spawnIds = spawns.map(spawn => spawn.id);
    Memory.creepNameId = 0;
  }

  public preTick(): void {
    this.queue.forEach((queueEntry) => {
      if (!this.countById.has(queueEntry[0])) {
        this.countById.set(queueEntry[0], 0);
      }

      this.countById.set(queueEntry[0], this.countById.get(queueEntry[0]) + 1);
    });
  }

  public hasSpaceForCreep(groupId: string): boolean {
    return !this.countById.has(groupId) || this.countById.get(groupId) < MAX_QUEUE_SIZE_PER_GROUP;
  }

  public addToQueue(entry: CreepSpawnQueueEntry): void {
    if (!entry) return;
    this.queue.push(entry);
  }

  public tick(): void {
    const queueEntry = this.queue[0];
    if (!queueEntry || this.room.energyAvailable < queueEntry[1]) return;

    this.logger.log(`inQueue=${this.queue.length}`);

    const selectedSpawn = this.spawnIds
      .map(spawnId => Game.getObjectById<StructureSpawn>(spawnId))
      .find(spawn => !spawn.spawning);
    if (!selectedSpawn) return;

    const manager = Globals.getGlobal<CreepsSpawner>(CreepsSpawner as any, queueEntry[0]);
    const bodyParts = manager.getBodyParts(queueEntry[2]);
    const creepName = `Creep${Memory.creepNameId}`;
    this.logger.log(`Spawning creep=${creepName} bodyParts=${JSON.stringify(bodyParts)}`);
    const spawnReturnValue = selectedSpawn.spawnCreep(bodyParts, creepName, {
      // TODO: get this based on prefab
      directions: [LEFT, BOTTOM_LEFT, BOTTOM],
    });
    if (spawnReturnValue !== OK) return;

    Memory.creepNameId++;
    EventLoop.getEventLoop().addEvent(CreepCreatedEventHandler.getEvent(
      this.room.name, creepName, queueEntry[0],
    ));
    this.queue.unshift();
  }
}
