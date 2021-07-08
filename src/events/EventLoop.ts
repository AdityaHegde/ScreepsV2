import {CreepCreatedEventEntry, CreepCreatedEventEntryType, CreepCreatedEventHandler} from "./CreepCreatedEventHandler";
import {MemoryClass} from "@memory/MemoryClass";
import {Globals} from "@globals/Globals";
import {EVENT_LOOP_ID} from "../constants";
import {BaseClass} from "../BaseClass";
import {
  ConstructionSiteCreatedEvent,
  ConstructionSiteCreatedEventHandler,
  ConstructionSiteCreatedEventType
} from "./ConstructionSiteCreatedEventHandler";
import {StructureBuiltEvent, StructureBuiltEventHandler, StructureBuiltEventType} from "./StructureBuiltEventHandler";
import {
  ResourceDroppedEvent,
  ResourceDroppedEventHandler,
  ResourceDroppedEventType
} from "./ResourceDroppedEventHandler";

export type EventEntry = (
  CreepCreatedEventEntry |
  ConstructionSiteCreatedEvent |
  StructureBuiltEvent |
  ResourceDroppedEvent
);

@MemoryClass("eventLoop")
export class EventLoop extends BaseClass {
  protected readonly eventHandlers = {
    [CreepCreatedEventEntryType]: new CreepCreatedEventHandler(),
    [ConstructionSiteCreatedEventType]: new ConstructionSiteCreatedEventHandler(),
    [StructureBuiltEventType]: new StructureBuiltEventHandler(),
    [ResourceDroppedEventType]: new ResourceDroppedEventHandler(),
  };

  protected events: Array<EventEntry>;

  public preTick(): void {
    this.events = this.filterEvents(Memory.events || []);
  }

  public postTick(): void {
    Memory.events = this.filterEvents();
  }

  public addEvent(eventEntry: EventEntry): void {
    this.events.push(eventEntry);
  }

  protected filterEvents(events = this.events): Array<EventEntry> {
    return events.filter(event => this.eventHandlers[event.type].handle(event as any));
  }

  public static getEventLoop(): EventLoop {
    return Globals.getGlobal<EventLoop>(EventLoop as any, EVENT_LOOP_ID, () => new EventLoop(EVENT_LOOP_ID));
  }
}
