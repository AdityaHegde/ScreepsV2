import {TargetPool} from "./TargetPool";
import {SourceTarget} from "../target/SourceTarget";
import {TargetPoolInstance} from "./TargetPoolInstance";

export class SourceTargetPool extends TargetPool<Source, SourceTarget> {
  public init(room: Room): void {
    const instance = this.getInstanceFromRoom<TargetPoolInstance<Source, SourceTarget>>(room, true)
      .setTarget(this.target);
    room.find(FIND_SOURCES).forEach(source => instance.addTarget(source));
  }
}
