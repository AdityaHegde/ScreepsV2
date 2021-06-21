export class Logger {
  private readonly label: string;

  private room: Room;

  public constructor(label: string) {
    this.label = label;
  }

  public setRoom(room: Room): Logger {
    this.room = room;
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

    return args;
  }
}
