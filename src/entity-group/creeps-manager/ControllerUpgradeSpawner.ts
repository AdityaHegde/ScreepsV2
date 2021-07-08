import {ControllerUpgradeGroup} from "../group/ControllerUpgradeGroup";
import {CreepsSpawner} from "./CreepsSpawner";

export class ControllerUpgradeSpawner extends CreepsSpawner {
  public shouldSpawnCreeps(): boolean {
    return !!(this.creepGroup as ControllerUpgradeGroup).containerId && super.shouldSpawnCreeps();
  }
}
