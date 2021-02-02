import { getInstanceFromClassObject } from "./getInstanceFromClassObject";
import { setInMemory } from "./setInMemory";

/**
 * Defines a property which references has a set of instances in memory.
 *
 * @param polymorphMap Map of class to use.
 */
export function instancePolymorphSetInMemory<T extends {id: any}>(
  polymorphMap: any, typeKey: string,
): any {
  return setInMemory<T>(function (value) {
    return value && [value[typeKey], value.id];
  }, function (value) {
    return getInstanceFromClassObject(polymorphMap[value[0]], value[1]);
  });
}
