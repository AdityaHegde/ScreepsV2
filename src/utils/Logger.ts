import {CreepWrapper} from "@wrappers/CreepWrapper";
import {EntityWrapper} from "@wrappers/EntityWrapper";

export class Logger {
  private readonly label: string;

  private room: Room;
  private entityWrapper: EntityWrapper<any>;

  public constructor(label: string) {
    this.label = label;
  }

  public setRoom(room: Room): Logger {
    this.room = room;
    return this;
  }

  public setEntityWrapper(entityWrapper: EntityWrapper<any>): Logger {
    this.entityWrapper = entityWrapper;
    return this;
  }

  public log(...messages: Array<any>): void {
    console.log(...this.getArgs(), ...messages);
  }

  private getArgs(): Array<string> {
    const args = [`[${this.label}]`];

    if (this.room) {
      args.push(`[${this.room.name}]`);
    }

    if (this.entityWrapper) {
      args.push(`entity=${this.entityWrapper.entity.name ?? this.entityWrapper.id}`);
      if ("task" in this.entityWrapper.memory) args.push(`task=${this.entityWrapper.task}`);
      if ("subTask" in this.entityWrapper.memory) args.push(`subTask=${this.entityWrapper.subTask}`);
    }

    return args;
  }
}
