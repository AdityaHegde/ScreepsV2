import { setInMemory } from "./setInMemory";
import { getInstanceFromClassObject } from "./getInstanceFromClassObject";

/**
 * Defines a property which references a set of instances in memory by id.
 */
export function instanceSetInMemory<T>(ClassObject): any {
  return setInMemory<T>((value) => {
    return value && value[ClassObject.idProperty];
  }, (value) => {
    return getInstanceFromClassObject(ClassObject, value);
  });
}
