import { mapInMemory } from "./mapInMemory";

/**
 * Defines map of path.
 */
export function pathMapInMemory(): any {
  return mapInMemory<any>((value) => {
    return Room.serializePath(value);
  }, (key, value) => {
    return Room.deserializePath(value);
  });
}
