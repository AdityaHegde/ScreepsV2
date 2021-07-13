import {GameGlobals} from "../GameGlobals";
import {StoreImpl} from "./StoreImpl";

export interface StructureImplOpts {
  structureType: StructureConstant;
  capacity?: number;
}

export class StructureImpl implements Structure {
  public effects: RoomObjectEffect[];
  public hits: number;
  public hitsMax: number;
  public id: Id<this>;
  public pos: RoomPosition;
  public readonly prototype: Structure;
  public room: Room;
  public structureType: StructureConstant;

  public store: StoreImpl;
  public gameGlobals: GameGlobals;

  public constructor(
    id: string, pos: RoomPosition, gameGlobals: GameGlobals,
    { structureType, capacity }: StructureImplOpts,
  ) {
    this.id = id as any;
    this.pos = pos;
    this.gameGlobals = gameGlobals;
    this.structureType = structureType;
    if (capacity) this.store = new StoreImpl(capacity);
  }

  public destroy(): ScreepsReturnCode {
    return undefined;
  }

  public isActive(): boolean {
    return false;
  }

  public notifyWhenAttacked(enabled: boolean): ScreepsReturnCode {
    return undefined;
  }
}
