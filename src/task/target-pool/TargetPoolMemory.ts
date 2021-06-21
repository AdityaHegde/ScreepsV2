import {BaseClassMemory} from "../../BaseClass";

export interface TargetPoolMemory extends BaseClassMemory {
  targets: Array<string>;

  targetWeight: Record<string, number>;
}
