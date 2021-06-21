export interface EventEntryBase {
  type: string;
}

export abstract class EventHandler<EventEntry extends EventEntryBase> {
  public abstract handle(eventEntry: EventEntry): boolean;
}
