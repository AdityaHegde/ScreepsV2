import "@globals/MemoryOverrides";
import {GameRunner} from "./runner/GameRunner";
import {simpleRoomRunnerFactory} from "./factory/simpleRoomRunnerFactory";
import {Globals} from "@globals/Globals";

export const loop = (): void => {
  Globals.init();
  GameRunner.getGameRunner(simpleRoomRunnerFactory).run();
};
