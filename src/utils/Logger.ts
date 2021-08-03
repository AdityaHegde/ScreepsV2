import {CreepWrapper} from "@wrappers/CreepWrapper";
import {GameEntity} from "@wrappers/GameEntity";
import {JobResourceIdx} from "@wrappers/group/JobParams";

export class Logger {
  private readonly label: string;

  private room: Room;
  private entityWrapper: GameEntity<any>;

  public constructor(label: string) {
    this.label = label;
  }

  public setRoom(room: Room): Logger {
    this.room = room;
    return this;
  }

  public setEntityWrapper(entityWrapper: GameEntity<any>): Logger {
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

    args.push(`tick=${Game.time}`);

    if (this.entityWrapper) {
      args.push(`entity=${this.entityWrapper.entity?.name ?? this.entityWrapper.id}`);
      if ("task" in this.entityWrapper.memory) args.push(`task=${this.entityWrapper.state}`);
      if ("subTask" in this.entityWrapper.memory) args.push(`subTask=${this.entityWrapper.subState}`);
      if ("weight" in this.entityWrapper.memory) args.push(`weight=${this.entityWrapper.weight}`);
      if ("targetWeight" in this.entityWrapper.memory) args.push(`targetWeight=${this.entityWrapper.targetWeight}`);
      if ((this.entityWrapper as CreepWrapper).job && this.entityWrapper.entity) {
        args.push(`resource=${(this.entityWrapper.entity as Creep).store[(this.entityWrapper as CreepWrapper).job[JobResourceIdx]]}`);
      }
    }

    return args;
  }
}
