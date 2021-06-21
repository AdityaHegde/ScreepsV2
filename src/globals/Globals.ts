import {BaseClass} from "../BaseClass";
import {BaseInstanceClass} from "../BaseInstanceClass";

/**
 * Abstraction to get globals across 
 */
export class Globals {
  public static instance = new Globals();

  private globalInstances = new Map<string, Map<string, BaseInstanceClass>>();
  private globalSingletons = new Map<string, BaseClass<any, any>>();

  public static getGlobal<T extends BaseInstanceClass>(
    Clazz: typeof BaseClass, id: string, instanceGetter: () => T, freshInstance?: boolean,
  ): T {
    return this.instance.getGlobal(Clazz, id, instanceGetter, freshInstance);
  }

  public static addGlobalSingleton<T extends BaseClass<any, any>>(singleton: T): T {
    this.instance.globalSingletons.set(singleton.idSuffix, singleton);
    return singleton;
  }

  public static getGlobalSingleton<T extends BaseClass<any, any>>(id: string): T {
    return this.instance.globalSingletons.get(id) as T;
  }

  private getGlobal<T extends BaseInstanceClass>(
    Clazz: typeof BaseClass, id: string, instanceGetter: () => T, freshInstance?: boolean,
  ): T {
    if (!this.globalInstances.has(Clazz.memoryName)) {
      this.globalInstances.set(Clazz.memoryName, new Map());
    }

    const globalsForClazz = this.globalInstances.get(Clazz.memoryName);

    if (freshInstance || !globalsForClazz.has(id)) {
      const instance = instanceGetter();
      globalsForClazz.set(id, instance);
      return instance;
    } else {
      return globalsForClazz.get(id) as T;
    }
  }
}
