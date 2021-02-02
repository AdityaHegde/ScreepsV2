import { mapInMemory } from "./mapInMemory";
import { getInstanceFromClassObject } from "./getInstanceFromClassObject";

/**
 * Defines a property which references has a map of instances in memory.
 */
export function instancePolymorphMapInMemory<T extends {id: string}>(polymorphMap): any {
  return mapInMemory<T>((value) => {
    return value && value.id;
  }, (key, value) => {
    return getInstanceFromClassObject(polymorphMap[key], value);
  });
}
