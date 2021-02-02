import { inMemory } from "./inMemory";

/**
 * Defines path property which is stored in memory using Room.serializePath.
 * And retrieved from memory using Room.deserializePath.
 */
export function pathInMemory(): any {
  return inMemory<any>(null, (value) => {
    return Room.serializePath(value);
  }, (value) => {
    return Room.deserializePath(value);
  });
}
