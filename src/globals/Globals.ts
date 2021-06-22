import {BaseClass} from "../BaseClass";

/**
 * Abstraction to get globals across 
 */
export class Globals {
  public static instance = new Globals();

  private globalInstances = new Map<string, Map<string, BaseClass>>();

  public static init(): void {
    this.instance = new Globals();
  }

  public static getGlobal<T extends BaseClass>(
    Clazz: typeof BaseClass, id: string, instanceGetter?: () => T, freshInstance?: boolean,
  ): T {
    return this.instance.getGlobal(Clazz, id, instanceGetter, freshInstance);
  }

  public static addGlobal<T extends BaseClass>(instance: T): T {
    this.instance.getGlobalsForClazz(instance.constructor as typeof BaseClass).set(instance.id, instance);
    return instance;
  }

  private getGlobal<T extends BaseClass>(
    Clazz: typeof BaseClass, id: string, instanceGetter?: () => T, freshInstance?: boolean,
  ): T {
    const globalsForClazz = this.getGlobalsForClazz(Clazz);

    if (freshInstance || !globalsForClazz.has(id)) {
      if (!instanceGetter) {
        return null;
      }
      const instance = instanceGetter();
      globalsForClazz.set(id, instance);
      return instance;
    } else {
      return globalsForClazz.get(id) as T;
    }
  }

  private getGlobalsForClazz(Clazz: typeof BaseClass) {
    if (!this.globalInstances.has(Clazz.memoryName)) {
      this.globalInstances.set(Clazz.memoryName, new Map());
    }

    return  this.globalInstances.get(Clazz.memoryName);
  }
}
