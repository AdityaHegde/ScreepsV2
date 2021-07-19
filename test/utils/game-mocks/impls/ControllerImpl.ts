import {CreepImpl} from "./CreepImpl";

export class ControllerImpl implements StructureController {
  public effects: RoomObjectEffect[];
  public hits: number;
  public hitsMax: number;
  public id: Id<this>;
  public isPowerEnabled: boolean;
  public level = 1;
  public my = true;
  public owner: Owner | undefined;
  public pos: RoomPosition;
  public progress = 1;
  public progressTotal = CONTROLLER_LEVELS[1];
  public readonly prototype: StructureController;
  public reservation: ReservationDefinition | undefined;
  public room: Room;
  public safeModeAvailable: number;
  public sign: SignDefinition | undefined;
  public structureType: STRUCTURE_CONTROLLER;
  public ticksToDowngrade: number;
  public upgradeBlocked: number;

  public constructor(
    id: string, pos: RoomPosition,
  ) {
    this.id = id as any;
    this.pos = pos;
  }

  public activateSafeMode(): ScreepsReturnCode {
    return undefined;
  }

  public destroy(): ScreepsReturnCode {
    return undefined;
  }

  public isActive(): boolean {
    return true;
  }

  public notifyWhenAttacked(enabled: boolean): ScreepsReturnCode {
    return undefined;
  }

  public unclaim(): ScreepsReturnCode {
    return undefined;
  }

  public upgrade(creep: CreepImpl): void {
    const amount = Math.min(creep.workCount * UPGRADE_CONTROLLER_POWER, creep.storeImpl.energy);
    creep.storeImpl.addEnergy(-amount);
    this.progress += amount;
    if (this.progress > this.progressTotal) {
      if (this.level < 8) {
        this.level++;
        this.progressTotal = CONTROLLER_LEVELS[this.level];
      } else {
        this.progress = this.progressTotal;
      }
    }
  }
}