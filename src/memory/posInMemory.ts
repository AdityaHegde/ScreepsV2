import { inMemory } from "./inMemory";

/**
 * Defines position property which is stored in memory as "x:y".
 */
export function posInMemory(): any {
  return inMemory<RoomPosition>(null, (pos: RoomPosition) => {
    return pos.x + ":" + pos.y;
  }, (pos) => {
    if (pos && this.room) {
      let xy = pos.split(":");
      return new RoomPosition(Number(xy[0]), Number(xy[1]), this.room.name);
    }
    return null;
  });
}
