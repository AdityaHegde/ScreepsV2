import {SinonSandbox, SinonStub} from "sinon";
import {GameGlobals} from "./GameGlobals";
import {RoomGrid} from "./RoomGrid";
import {MAX_X, MAX_Y} from "../PathTestUtils";
import {CreepImpl} from "./impls/CreepImpl";
import {StructureImpl, StructureImplOpts} from "./impls/StructureImpl";
import {ConstructionSiteImpl, ConstructionSiteImplOpts} from "./impls/ConstructionSiteImpl";
import {BaseEntityType} from "@wrappers/EntityWrapper";

export class GameMocks {
  private readonly sandbox: SinonSandbox;
  private getObjectByIdStub: SinonStub;

  public readonly gameGlobals: GameGlobals;

  public constructor(sandbox: SinonSandbox) {
    this.sandbox = sandbox;
    this.gameGlobals = new GameGlobals(this.sandbox, new RoomGrid(MAX_X, MAX_Y));
  }

  public init(): void {
    this.getObjectByIdStub = this.sandbox.stub();
    (global as any).Game = {
      getObjectById: this.getObjectByIdStub,
      time: 0,
    };
    (global as any).Creep = CreepImpl;
    (global as any).Structure = StructureImpl;
    (global as any).ConstructionSite = ConstructionSiteImpl
  }

  public getCreep(name: string, pos: RoomPosition): Creep {
    return this.mockObject(new CreepImpl(name, pos, this.gameGlobals));
  }

  public getConstructionSite(id: string, pos: RoomPosition, opts: ConstructionSiteImplOpts): ConstructionSite {
    return this.mockObject(new ConstructionSiteImpl(id, pos, this.gameGlobals, opts));
  }

  public getStructure(id: string, pos: RoomPosition, opts: StructureImplOpts): Structure {
    return this.mockObject(new StructureImpl(id, pos, this.gameGlobals, opts));
  }

  public destroy(entity: BaseEntityType): void {
    this.getObjectByIdStub.withArgs(entity.id).returns(null);
  }

  private mockObject<T extends BaseEntityType>(object: T): T {
    this.getObjectByIdStub.withArgs(object.id).returns(object);
    return object;
  }
}
