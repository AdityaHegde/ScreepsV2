import {BaseClass} from "../../BaseClass";
import {TargetPoolMemory} from "./TargetPoolMemory";
import {TargetPoolInstance} from "./TargetPoolInstance";
import {BaseTargetType, Target} from "../target/Target";

export interface TargetPoolOpts<TargetClass> {
  target: TargetClass;
}

@BaseClass.Class("targetPool")
export abstract class TargetPool<
  TargetType extends BaseTargetType, TargetClass extends Target<any>,
> extends BaseClass<TargetPoolMemory, TargetPoolOpts<TargetClass>> {
  protected readonly target: TargetClass;

  public abstract init(room: Room): void;

  public preTick(room: Room): void {
    this.getInstanceFromRoom<TargetPoolInstance<TargetType, TargetClass>>(room).setTarget(this.target).preTick();
  }

  public getTargetPoolInstance(room: Room): TargetPoolInstance<TargetType, TargetClass> {
    return this.getInstanceFromRoom<TargetPoolInstance<TargetType, TargetClass>>(room);
  }

  public postTick(room: Room): void {
    this.getInstanceFromRoom<TargetPoolInstance<TargetType, TargetClass>>(room).postTick();
  }

  public updateTargets(room: Room): void {
    this.getInstanceFromRoom<TargetPoolInstance<TargetType, TargetClass>>(room)
      .setTarget(this.target).updateTargets();
  }

  public updateTarget(room: Room, targetId: string): void {
    this.getInstanceFromRoom<TargetPoolInstance<TargetType, TargetClass>>(room)
      .setTarget(this.target).updateTarget(targetId);
  }

  protected getBlankMemory(id: string): TargetPoolMemory {
    return {
      id,
      targets: [], targetWeight: {},
    };
  }
}
