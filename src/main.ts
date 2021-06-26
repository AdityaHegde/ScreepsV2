import {EventEntry, EventLoop} from "./events/EventLoop";
import {GameRunner} from "./runner/GameRunner";
import {simpleRoomRunnerFactory} from "./factory/simpleRoomRunnerFactory";
import {Globals} from "./globals/Globals";

declare global {
  interface Memory {
    creepNameId: number;
    events: Array<EventEntry>;
  }

  interface RoomMemory {
    initialised: boolean;
    planned: boolean;
  }

  interface CreepMemory {
    target?: string;
    weight?: number;

    power?: number;

    task?: number;
    subTask?: number;
  }
}

export const loop = (): void => {
  Globals.init();
  new GameRunner(EventLoop.getEventLoop(), simpleRoomRunnerFactory).run();
};
