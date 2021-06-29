import "../src/globals/GlobalConstants";
import "../src/globals/MemoryOverrides";
import _ from "lodash";

(global as any)._ = _;
(global as any).Room = class {};
(global as any).RoomPosition = class {
  public x: number; public y: number; public roomName: number;
  public constructor(x: number, y: number, roomName: number) {
    this.x = x; this.y = y; this.roomName = roomName;
  }
}