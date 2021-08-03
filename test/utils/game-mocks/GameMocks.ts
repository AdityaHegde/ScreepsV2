import {SinonSandbox, SinonStub} from "sinon";
import {GameGlobals} from "./GameGlobals";
import {RoomGrid} from "./RoomGrid";
import {MAX_X, MAX_Y} from "../PathTestUtils";
import {CreepImpl, CreepImplOpts} from "./impls/CreepImpl";
import {StructureImpl, StructureImplOpts} from "./impls/StructureImpl";
import {ConstructionSiteImpl, ConstructionSiteImplOpts} from "./impls/ConstructionSiteImpl";
import {BaseEntityType} from "@wrappers/GameEntity";
import {SourceImpl} from "./impls/SourceImpl";
import {ControllerImpl} from "./impls/ControllerImpl";
import {RoomImpl} from "@test-utils/game-mocks/impls/RoomImpl";
import {ArrayPos} from "../../../src/preprocessing/Prefab";

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
    (global as any).ConstructionSite = ConstructionSiteImpl;
    (global as any).Source = SourceImpl;
    (global as any).StructureController = ControllerImpl;
  }

  public getRoom(name: string, controllerPos?: RoomPosition, sourcesPos?: Array<RoomPosition>): RoomImpl {
    return new RoomImpl(name,
      controllerPos ? this.getController(`${name}-c`, controllerPos) : null,
      sourcesPos ? sourcesPos.map((sourcePos, idx) => this.getSource(`${name}-s-${idx}`, sourcePos)) : []);
  }

  public getCreep(name: string, pos: RoomPosition, opts?: CreepImplOpts): CreepImpl {
    return this.mockObject(new CreepImpl(name, pos, this.gameGlobals, opts));
  }

  public getConstructionSite(id: string, pos: RoomPosition, opts: ConstructionSiteImplOpts): ConstructionSiteImpl {
    return this.mockObject(new ConstructionSiteImpl(id, pos, this.gameGlobals, opts));
  }

  public getStructure(id: string, pos: RoomPosition, opts: StructureImplOpts): StructureImpl {
    return this.mockObject(new StructureImpl(id, pos, this.gameGlobals, opts));
  }

  public getSource(id: string, pos: RoomPosition): SourceImpl {
    return this.mockObject(new SourceImpl(id, pos));
  }

  public getController(id: string, pos: RoomPosition): ControllerImpl {
    return this.mockObject(new ControllerImpl(id, pos));
  }

  public destroy(entity: BaseEntityType): void {
    this.getObjectByIdStub.withArgs(entity.id).returns(null);
  }

  private mockObject<T extends BaseEntityType>(object: T): T {
    this.getObjectByIdStub.withArgs(object.id).returns(object);
    return object;
  }
}
