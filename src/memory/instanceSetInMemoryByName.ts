import { setInMemory } from "./setInMemory";

/**
 * Defines a property which references a set of instances in memory by name.
 */
export function instanceSetInMemoryByName<T extends {name: string}>(memoryName: string): any {
  return setInMemory<T>((value) => {
    return value && value.name;
  }, (value) => {
    let instance = Game[memoryName][value];
    return instance;
  });
}
