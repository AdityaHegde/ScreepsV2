import {RoomGrid} from "./RoomGrid";
import {SinonSandbox} from "sinon";

export class GameGlobals {
  public sandbox: SinonSandbox;
  public roomGrid: RoomGrid;

  public actions: Array<() => void>;

  public constructor(sandbox: SinonSandbox, roomGrid: RoomGrid) {
    this.sandbox = sandbox;
    this.roomGrid = roomGrid;
  }

  public addAction(action: () => void): void {
    this.actions.push(action);
  }

  public preTick(): void {
    this.actions = [];
  }

  public postTick(): void {
    this.actions.forEach(action => action());
  }
}
