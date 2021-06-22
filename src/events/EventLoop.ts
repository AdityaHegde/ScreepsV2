import {CreepCreatedEventEntry, CreepCreatedEventHandler} from "./CreepCreatedEventHandler";
import {BaseClass} from "../BaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {Globals} from "../globals/Globals";
import {EVENT_LOOP_ID} from "../constants";

export type EventEntry = CreepCreatedEventEntry;

@MemoryClass("eventLoop")
export class EventLoop extends BaseClass {
  protected readonly eventHandlers = {
    creepCreated: new CreepCreatedEventHandler(),
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
    return events.filter(event => this.eventHandlers[event.type].handle(event));
  }

  public static getEventLoop(): EventLoop {
    return Globals.getGlobal<EventLoop>(EventLoop as any, EVENT_LOOP_ID, () => new EventLoop(EVENT_LOOP_ID, null));
  }
}
