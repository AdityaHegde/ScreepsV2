import {BaseClassMemory} from "../../BaseClass";

export interface CreepPoolMemory extends BaseClassMemory {
  parts: Array<BodyPartConstant>;
  partsCost: number;
  partsIdx: number;

  creeps: Array<string>;
  power: number;
}