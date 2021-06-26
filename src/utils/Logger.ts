export class Logger {
  private readonly label: string;

  private room: Room;
  private creep: Creep;

  public constructor(label: string) {
    this.label = label;
  }

  public setRoom(room: Room): Logger {
    this.room = room;
    return this;
  }

  public setCreep(creep: Creep): Logger {
    this.creep = creep;
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

    if (this.creep) {
      args.push(`creep=${this.creep.name} task=${this.creep.memory.task} subTask=${this.creep.memory.subTask}`);
    }

    return args;
  }
}
