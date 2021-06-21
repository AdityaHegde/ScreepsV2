import {Logger} from "./utils/Logger";
import {getClassName} from "./utils/getClassName";
import {BaseInstanceClass} from "./BaseInstanceClass";
import {Globals} from "./globals/Globals";

export interface BaseClassMemory {
  id: string;
}

export class BaseClass<MemoryType extends BaseClassMemory, ConstructorOpts extends Record<string, any>> {
  public static className: string;
  public static memoryName: string;

  public readonly idSuffix: string;
  protected readonly InstanceClazz: typeof BaseInstanceClass;
  protected logger = new Logger("Basic");

  public constructor(
    idSuffix: string, InstanceClazz: typeof BaseInstanceClass,
    opts: ConstructorOpts,
  ) {
    this.idSuffix = idSuffix;
    this.InstanceClazz = InstanceClazz;
    for (const opt in opts) {
      if (Object.prototype.hasOwnProperty.call(opts, opt)) {
        (this as any)[opt] = opts[opt];
      }
    }
  }

  protected getBlankMemory(id: string): MemoryType {
    return { id } as MemoryType;
  }

  protected getMemory(id: string): MemoryType {
    const Clazz = this.constructor as typeof BaseClass;

    Memory[Clazz.memoryName] ??= {};

    const ClazzMemory = Memory[Clazz.memoryName] as Record<string, MemoryType>;

    if (!ClazzMemory[id]) {
      const memory = this.getBlankMemory(id);
      ClazzMemory[id] = memory;
      return memory;
    }

    return ClazzMemory[id];
  }

  protected getInstance<T extends BaseInstanceClass<MemoryType> = BaseInstanceClass<MemoryType>>(
    id: string, freshInstance?: boolean,
  ): T {
    return Globals.getGlobal<T>(this.constructor as typeof BaseClass, id,
      () => new this.InstanceClazz(id, this.getMemory(id)) as T, freshInstance);
  }

  protected getIdFromRoom(room: Room): string {
    return `${room.name}-${this.idSuffix}`;
  }

  protected getMemoryFromRoom(room: Room): MemoryType {
    return this.getMemory(this.getIdFromRoom(room));
  }

  protected getInstanceFromRoom<T extends BaseInstanceClass<MemoryType> = BaseInstanceClass<MemoryType>>(
    room: Room, freshInstance?: boolean,
  ): T {
    return this.getInstance<T>(this.getIdFromRoom(room), freshInstance);
  }

  public static Class(memoryName: string): any {
    return function(classObject: typeof BaseClass) {
      classObject.className = getClassName(classObject);
      classObject.memoryName = memoryName;
    }
  }
}
