import {CreepCreatedEventEntry, CreepCreatedEventHandler} from "./CreepCreatedEventHandler";
import {BaseClass, BaseClassMemory} from "../BaseClass";

export type EventEntry = CreepCreatedEventEntry;

export class EventLoop extends BaseClass<BaseClassMemory, any> {
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
}
