import {Logger} from "./utils/Logger";

export class BaseClass {
  public static className: string;
  public static memoryName: string;

  public readonly id: string;
  public readonly room: Room;
  public readonly memory: Record<string, any>;
  protected logger = new Logger("Basic");

  public constructor(id: string, room: Room) {
    this.id = id;
    this.room = room;
  }
}
