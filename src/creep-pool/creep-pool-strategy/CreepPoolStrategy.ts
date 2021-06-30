import {ColonyBaseClass} from "../../ColonyBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";

@MemoryClass("creepPoolStrategy")
export class CreepPoolStrategy extends ColonyBaseClass {
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
