import {BaseClass} from "./BaseClass";

export class ColonyBaseClass extends BaseClass {
  public static memoryName: string;

  public readonly room: Room;

  public constructor(id: string, room: Room) {
    super(id);
    this.room = room;
  }
}
