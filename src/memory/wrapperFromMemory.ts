import {BaseClass} from "../BaseClass";
import {getWrapperById} from "@wrappers/getWrapperById";

export function wrapperFromMemory<T>(fromKey: string): any {
  return function(classPrototype: typeof BaseClass, fieldName: string, descriptor: TypedPropertyDescriptor<T>) {
    descriptor = descriptor || {};
    const cachedFieldName = "cached_" + fieldName;

    descriptor.get = function(this: BaseClass) {
      if (!(cachedFieldName in this) && this[fromKey]) {
        this[cachedFieldName] = getWrapperById(this[fromKey]);
      }
      // return from cache
      return this[cachedFieldName];
    };
  }
}
