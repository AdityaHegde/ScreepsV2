import {GameGlobals} from "../GameGlobals";

export interface ConstructionSiteImplOpts {
  progressTotal: number;
  structureType: BuildableStructureConstant;
}

export class ConstructionSiteImpl implements ConstructionSite {
  public effects: RoomObjectEffect[];
  public id: Id<this>;
  public my = true;
  public owner: Owner;
  public pos: RoomPosition;
  public progress = 0;
  public progressTotal: number;
  public readonly prototype: ConstructionSite;
  public room: Room | undefined;
  public structureType: BuildableStructureConstant;

  public gameGlobals: GameGlobals;

  public constructor(
    id: string, pos: RoomPosition, gameGlobals: GameGlobals,
    { progressTotal, structureType }: ConstructionSiteImplOpts,
  ) {
    this.id = id as any;
    this.pos = pos;
    this.gameGlobals = gameGlobals;
    this.progressTotal = progressTotal;
    this.structureType = structureType;
  }

  public remove(): number {
    return 0;
  }

  public build(power: number): number {
    if (this.progress + power > this.progressTotal) {
      power = this.progressTotal - this.progress;
      this.progress = this.progressTotal;
    } else {
      this.progress += power;
    }
    return power;
  }
}
