/**
 * Defines a property which gets mirrored in memory. Prototype should have a property 'memory'
 */
import {BaseClass} from "../BaseClass";

export function inMemory<T>(
  getter: () => T = () => null,
  serializer: (value: T) => any = (value: T) => value,
  deserializer: (value: any) => T = (value: any) => value,
): any {
  return function(classPrototype: typeof BaseClass, fieldName: string, descriptor: TypedPropertyDescriptor<T>) {
    descriptor = descriptor || {};
    const cachedFieldName = "cached_" + fieldName;

    descriptor.get = function(this: BaseClass) {
      // if the property is not defined in cache yet, get it from memory
      if (!(cachedFieldName in this)) {
        // if the property is not present in the memory either, use the getter function passed to get the value and store in memory
        if (!(fieldName in this.memory)) {
          this[cachedFieldName] = getter.call(this);
          this.memory[fieldName] = this[cachedFieldName] && serializer.call(this, this[cachedFieldName]);
        } else {
          this[cachedFieldName] = deserializer.call(this, this.memory[fieldName]);
        }
      }
      // return from cache
      return this[cachedFieldName];
    };

    descriptor.set = function(this: BaseClass, value: T) {
      // save the serialized value to memory and value to cache
      if (value === undefined) {
        delete this.memory[fieldName];
      } else {
        this.memory[fieldName] = serializer.call(this, value);
      }
      this[cachedFieldName] = value;
    };

    return descriptor;
  };
}
