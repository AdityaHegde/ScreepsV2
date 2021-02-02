import { Logger } from "./utils/Logger";

export abstract class BaseClass {
  public id: string;
  public static className: string;
  public static memoryName: string;
  public static idProperty: string;

  protected logger: Logger;

  constructor(id = "") {
    if (id === "") {
      const ids = (Memory as any).ids || {};
      if (!(Memory as any).ids) {
        (Memory as any).ids = ids;
      }
      if (!ids[this.constructor["memoryName"]]) {
        ids[this.constructor["memoryName"]] = 0;
      }
      id = "" + ++ids[this.constructor["memoryName"]];
    }

    this.id = id;
  }

  public static getInstanceById(id: string): BaseClass {
    return new (this as any)(id);
  }
}
