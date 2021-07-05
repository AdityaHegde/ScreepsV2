import {Planner} from "./Planner";
import {ColonyPlanner} from "./ColonyPlanner";
import {BuildingPlan, Prefab} from "../preprocessing/Prefab";
import * as Bunker from "../data/Bunker";
const {BunkerPrefab} = Bunker as {BunkerPrefab: Prefab};

export class BunkerPlanner extends Planner {
  public plan(colonyPlanner: ColonyPlanner): void {
    BunkerPrefab[1].forEach((rclPrefab, index) => {
      let rclPrefabForRoom: Array<BuildingPlan>;

      if (colonyPlanner.rclPrefabs.length > index) {
        rclPrefabForRoom = colonyPlanner.rclPrefabs[index];
      } else {
        rclPrefabForRoom = [];
        colonyPlanner.rclPrefabs.push(rclPrefabForRoom);
      }

      rclPrefab.forEach((buildingPrefab) => {
        const buildingPlan: BuildingPlan = [buildingPrefab[0], []];
        buildingPrefab[1].forEach((buildingPos) => {
          if (buildingPos[1][0] === 0 && buildingPos[1][1] === 0) {
            return;
          }
          colonyPlanner.addBuildingPos(buildingPlan, [
            buildingPos[1][0] + colonyPlanner.center[0], buildingPos[1][1] + colonyPlanner.center[1],
          ]);
        });
        rclPrefabForRoom.push(buildingPlan);
      });
    });

    BunkerPrefab[2].forEach((rawRoad) => {
      rawRoad.forEach((roadPos) => {
        roadPos[0] += colonyPlanner.center[0];
        roadPos[1] += colonyPlanner.center[1];
      });
      colonyPlanner.pathFinder.addRoad(rawRoad);
    });
  }

  public static getBunkerPlan(): BunkerPlanner {
    return new BunkerPlanner();
  }
}
