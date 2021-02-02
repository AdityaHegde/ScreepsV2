import { inMemory } from "./inMemory";

/**
 * Defines a property which references an instance. Instance is stored by 'id' in memory.
 * Prototype should have a property 'memory'.
 * 
 * @param [ClassObject] Class for the instance. If not specified, Game.getObjectById is used.
 * @param [getter] Function that returns the initial value for 'property'. Defaults value to empty instance of ClassObject if specified.
 */
export function instanceInMemory<T extends {id: any}>(
  ClassObject = null, getter: () => T = null
): any {
  return inMemory<T>(() => {
    return getter ? getter() : (ClassObject && new ClassObject());
  }, (instance: T) => {
    return instance && instance.id;
  }, (instanceId: any) => {
    if (instanceId) {
      let instance: T;
      if (ClassObject) {
        instance = new ClassObject(instanceId);
      } else {
        instance = Game.getObjectById(instanceId);
      }
      return instance;
    }
  });
}
