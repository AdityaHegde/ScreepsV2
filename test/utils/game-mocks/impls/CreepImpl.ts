import {GameGlobals} from "../GameGlobals";
import {StoreImpl} from "./StoreImpl";
import {ConstructionSiteImpl} from "./ConstructionSiteImpl";

export interface CreepImplOpts {
  workCount?: number;
  carryCount?: number;
}

export class CreepImpl implements Creep {
  public body: BodyPartDefinition[];
  public carry: StoreDefinition;
  public carryCapacity: number;
  public effects: RoomObjectEffect[];
  public fatigue = 0;
  public hits: number;
  public hitsMax: number;
  public id: Id<this>;
  public memory: CreepMemory;
  public my = true;
  public name: string;
  public owner: Owner;
  public pos: RoomPosition;
  public readonly prototype: Creep;
  public room: Room;
  public saying: string;
  public spawning = false;
  public store: StoreDefinition;
  public ticksToLive: number | undefined;

  public readonly gameGlobals: GameGlobals;

  private readonly workCount: number;
  private readonly carryCount: number;
  private readonly storeImpl: StoreImpl;

  public constructor(
    name: string, pos: RoomPosition, gameGlobals: GameGlobals,
    { workCount, carryCount }: CreepImplOpts = {},
  ) {
    this.id = name as any;
    this.name = name;
    this.pos = pos;
    this.gameGlobals = gameGlobals;
    this.workCount = workCount ?? 1;
    this.carryCount = carryCount ?? 1;
    this.storeImpl = new StoreImpl(this.carryCount * CARRY_CAPACITY);
    this.store = this.storeImpl as any;
  }

  public attack(target: AnyCreep | Structure): CreepActionReturnCode {
    return OK;
  }

  public attackController(target: StructureController): CreepActionReturnCode {
    return OK;
  }

  public build(target: ConstructionSite): CreepActionReturnCode | ERR_NOT_ENOUGH_RESOURCES | ERR_RCL_NOT_ENOUGH {
    if (target instanceof ConstructionSiteImpl) {
      this.gameGlobals.addAction(() => {
        this.storeImpl.addEnergy(-target.build(this.workCount * BUILD_POWER));
      });
    }
    return OK;
  }

  public cancelOrder(methodName: string): OK | ERR_NOT_FOUND {
    return OK;
  }

  public claimController(target: StructureController): CreepActionReturnCode | ERR_FULL | ERR_GCL_NOT_ENOUGH {
    return OK;
  }

  public dismantle(target: Structure): CreepActionReturnCode {
    return OK;
  }

  public drop(resourceType: ResourceConstant, amount?: number): OK | ERR_NOT_OWNER | ERR_BUSY | ERR_NOT_ENOUGH_RESOURCES {
    return OK;
  }

  public generateSafeMode(target: StructureController): CreepActionReturnCode {
    return OK;
  }

  public getActiveBodyparts(type: BodyPartConstant): number {
    return 0;
  }

  public harvest(target: Source | Mineral | Deposit): CreepActionReturnCode | ERR_NOT_FOUND | ERR_NOT_ENOUGH_RESOURCES {
    return OK;
  }

  public heal(target: AnyCreep): CreepActionReturnCode {
    return OK;
  }

  public move(direction: DirectionConstant): CreepMoveReturnCode;
  public move(target: Creep): OK | ERR_NOT_OWNER | ERR_BUSY | ERR_NOT_IN_RANGE | ERR_INVALID_ARGS;
  public move(direction: DirectionConstant | Creep): CreepMoveReturnCode | OK | ERR_NOT_OWNER | ERR_BUSY | ERR_NOT_IN_RANGE | ERR_INVALID_ARGS {
    if (direction instanceof CreepImpl) return ERR_INVALID_ARGS;
    this.gameGlobals.addAction(() => {
      this.gameGlobals.roomGrid.move(this, direction as DirectionConstant);
    });
    return OK;
  }

  public moveByPath(path: PathStep[] | RoomPosition[] | string): CreepMoveReturnCode | ERR_NOT_FOUND | ERR_INVALID_ARGS {
    return OK;
  }

  public moveTo(x: number, y: number, opts?: MoveToOpts): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET;
  public moveTo(target: RoomPosition | { pos: RoomPosition }, opts?: MoveToOpts): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND;
  public moveTo(x: number | RoomPosition | { pos: RoomPosition }, y?: number | MoveToOpts, opts?: MoveToOpts): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND {
    return OK;
  }

  public notifyWhenAttacked(enabled: boolean): OK | ERR_NOT_OWNER | ERR_BUSY | ERR_INVALID_ARGS {
    return OK;
  }

  public pickup(target: Resource): CreepActionReturnCode | ERR_FULL {
    return OK;
  }

  public pull(target: Creep): OK | ERR_NOT_OWNER | ERR_BUSY | ERR_INVALID_TARGET | ERR_NOT_IN_RANGE | ERR_NO_BODYPART {
    return OK;
  }

  public rangedAttack(target: AnyCreep | Structure): CreepActionReturnCode {
    return OK;
  }

  public rangedHeal(target: AnyCreep): CreepActionReturnCode {
    return OK;
  }

  public rangedMassAttack(): OK | ERR_NOT_OWNER | ERR_BUSY | ERR_NO_BODYPART {
    return OK;
  }

  public repair(target: Structure): CreepActionReturnCode | ERR_NOT_ENOUGH_RESOURCES {
    return OK;
  }

  public reserveController(target: StructureController): CreepActionReturnCode {
    return OK;
  }

  public say(message: string, toPublic?: boolean): OK | ERR_NOT_OWNER | ERR_BUSY {
    return OK;
  }

  public signController(target: StructureController, text: string): OK | ERR_BUSY | ERR_INVALID_TARGET | ERR_NOT_IN_RANGE {
    return OK;
  }

  public suicide(): OK | ERR_NOT_OWNER | ERR_BUSY {
    return OK;
  }

  public transfer(target: AnyCreep | Structure, resourceType: ResourceConstant, amount?: number): ScreepsReturnCode {
    this.gameGlobals.addAction(() => {
      this.storeImpl.transfer((target as any).store as StoreImpl);
    });
    return OK;
  }

  public upgradeController(target: StructureController): ScreepsReturnCode {
    return OK;
  }

  public withdraw(target: Structure | Tombstone | Ruin, resourceType: ResourceConstant, amount?: number): ScreepsReturnCode {
    this.gameGlobals.addAction(() => {
      ((target as any).store as StoreImpl).transfer(this.storeImpl);
    });
    return OK;
  }
}
