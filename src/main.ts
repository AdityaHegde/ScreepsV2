import "@globals/MemoryOverrides";
import {GameRunner} from "./runner/GameRunner";
import {Globals} from "@globals/Globals";
import {simpleRoomRunnerFactory} from "./factory/simpleRoomRunnerFactory";

export const loop = (): void => {
  Globals.init();
  GameRunner.getGameRunner(simpleRoomRunnerFactory).run();
};
