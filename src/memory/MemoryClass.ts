import {getClassName} from "../utils/getClassName";
import {BaseClass} from "../BaseClass";

/**
 * Adds memory support to the class.
 */
export function MemoryClass(memoryName: string): any {
  return function(classObject: typeof BaseClass) {
    classObject.className = getClassName(classObject);
    classObject.memoryName = memoryName;

    // define a property "memory" that gets an object
    // from memory space of class from Screeps's Memory
    Object.defineProperty(classObject.prototype, "memory", {
      get() {
        // if a memory space for this class doesnt exist
        // create one under Screeps's Memory
        Memory[memoryName] ??= {};
        // if a memory object doesnt exists in class's memory space
        // create one under the class's memory space
        Memory[memoryName][this.id] ??= {};
        return Memory[memoryName][this.id];
      },
      enumerable: true,
      configurable: true
    });
  };
}
