import { inMemory } from "./inMemory";

/**
 * Defines a property which references an instance. Instance is stored by 'name' in memory.
 * Prototype should have a property 'memory'.
 *
 * @param memoryName memoryName for the class of instance on Game.
 */
export function instanceInMemoryByName<T extends {name: string}>(memoryName: string): any {
  return inMemory<T>(null, (instance: T) => {
    return instance.name;
  }, (instanceName: string) => {
    let instance = Game[memoryName][instanceName];
    return instance;
  });
}
