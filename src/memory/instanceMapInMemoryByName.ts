import { mapInMemory } from "./mapInMemory";

/**
 * Defines a property which references a map of instances in memory by name.
 */
export function instanceMapInMemoryByName<T extends {name: string}>(memoryName: string): any {
  return mapInMemory<T>((value) => {
    return value && value.name;
  }, (key, value) => {
    let instance = Game[memoryName][value];
    return instance;
  });
}
