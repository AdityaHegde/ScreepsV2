import {SinonSandbox, SinonStub} from "sinon";

export class GameMocks {
  private sandbox: SinonSandbox;
  private getObjectByIdStub: SinonStub;

  public constructor(sandbox: SinonSandbox) {
    this.sandbox = sandbox;
  }

  public init(): void {
    this.getObjectByIdStub = this.sandbox.stub();
    (global as any).Game = {
      getObjectById: this.getObjectByIdStub,
    };
  }

  public getCreep(name: string, pos: RoomPosition): Creep {
    const creep: Creep = {
      id: name, name, pos,
      move: this.sandbox.stub(),
      transfer: this.sandbox.stub(),
      harvest: this.sandbox.stub(),
      drop: this.sandbox.stub(),
    } as any;
    this.getObjectByIdStub.withArgs(name).returns(creep);
    return creep;
  }
}
