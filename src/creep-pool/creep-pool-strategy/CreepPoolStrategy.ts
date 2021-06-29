import {RoomBaseClass} from "../../RoomBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";

@MemoryClass("creepPoolStrategy")
export class CreepPoolStrategy extends RoomBaseClass {
  @inMemory()
  public maxCreeps: number;

  @inMemory()
  public maxPowerPartCount: number;

  public constructor(
    id: string, room: Room,
    maxCreeps = 0, maxPowerPartCount = 0,
  ) {
    super(id, room);
    this.maxCreeps = maxCreeps;
    this.maxPowerPartCount = maxPowerPartCount;
  }

  public init(): void {
    // should implement
  }
}
