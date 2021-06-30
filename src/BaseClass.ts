import {Logger} from "./utils/Logger";

export class BaseClass {
  public static className: string;
  public static memoryName: string;

  public readonly id: string;
  public readonly memory: Record<string, any>;
  protected logger = new Logger("Basic");

  public constructor(id: string) {
    this.id = id;
  }

  public destroy(): void {
    delete Memory[(this.constructor as typeof BaseClass).memoryName]?.[this.id];
  }
}
