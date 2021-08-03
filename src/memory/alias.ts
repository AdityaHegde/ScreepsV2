import {BaseClass} from "../BaseClass";
import _ from "lodash";

export function alias<T>(toKey: string): any {
  return function(classPrototype: typeof BaseClass, fieldName: string, descriptor: TypedPropertyDescriptor<T>) {
    descriptor = descriptor || {};

    descriptor.get = function(this: BaseClass) {
      return _.get(this, toKey);
    };
  }
}