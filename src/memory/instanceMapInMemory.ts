import { getInstanceFromClassObject } from "./getInstanceFromClassObject";
import { mapInMemory } from "./mapInMemory";

/**
 * Defines a property which references a map of instances in memory by id.
 */
export function instanceMapInMemory<T>(ClassObject): any {
  return mapInMemory<T>((value) => {
    return value && value[ClassObject.idProperty];
  }, (key, value) => {
    return getInstanceFromClassObject(ClassObject, value);
  });
}
