import "../src/globals/GlobalConstants";
import "../src/globals/MemoryOverrides";
import _ from "lodash";

(global as any)._ = _;
(global as any).Room = class {
  public name: string;
  public constructor(name: string) {
    this.name = name;
  }
};
(global as any).Room.Terrain = class {
  public get() {return 0}
};
(global as any).RoomPosition = class {
  public x: number; public y: number; public roomName: number;
  public constructor(x: number, y: number, roomName: number) {
    this.x = x; this.y = y; this.roomName = roomName;
  }
};
(global as any).Game = {};
(global as any).StructureController = class {};
(global as any).Source = class {};
(global as any).Mineral = class {};
(global as any).Resource = class {};