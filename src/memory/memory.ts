import { BaseClass } from "../BaseClass";

const ClassNameRegex = /class (\w*)/;
const FunctionNameRegex = /\[Function: (.*)\]/;

/**
 * Adds memory support to the class.
 */
export function memory(memoryName: string, idProperty: string = "id"): any {
  return function(classObject: typeof BaseClass) {
    const classMatch = classObject.toString().match(ClassNameRegex);
    const functionMatch = classObject.toString().match(FunctionNameRegex);
    const className = (classMatch && classMatch[1]) ||
      (functionMatch && functionMatch[1]);

    classObject.className = className.toLowerCase();
    classObject.memoryName = memoryName;
    classObject.idProperty = idProperty;

    // define a property "memory" that gets an object
    // from memory space of class from Screeps's Memory
    Object.defineProperty(classObject.prototype, "memory", {
      get: function() {
        // if a memory space for this class doesnt exist
        // create one under Screeps's Memory
        if (!Memory[memoryName]) {
          Memory[memoryName] = {};
        }
        // if a memory object doesnt exisit in class's memory space
        // create one under the class's memory space
        if (!Memory[memoryName][this[idProperty]]) {
          Memory[memoryName][this[idProperty]] = {};
        }
        return Memory[memoryName][this[idProperty]];
      },
      enumerable: true,
      configurable: true
    });
  };
}
