import {Planner} from "./Planner";
import {ColonyPlanner} from "./ColonyPlanner";
import {BuildingTypeToPrefabTypeMap} from "../preprocessing/ParserMetadata";
import {getWrapperById} from "@wrappers/getWrapperById";
import {ControllerWrapper} from "@wrappers/ControllerWrapper";
import {HarvestableEntityType, HarvestableEntityWrapper} from "@wrappers/HarvestableEntityWrapper";
import {ArrayPos, BuildingPlan, RoadPos} from "../preprocessing/Prefab";

export class RoadPlanner extends Planner {
  public toStructureId: string;
  public range: number;

  public constructor(toStructureId: string, range: number) {
    super();
    this.toStructureId = toStructureId;
    this.range = range;
  }

  public plan(colonyPlanner: ColonyPlanner): void {
    const targetEntity = getWrapperById(this.toStructureId) as ControllerWrapper | HarvestableEntityWrapper<HarvestableEntityType>;
    const roadBuildingPlan = colonyPlanner.rclPrefabs[0]
      .find(buildingPrefab => buildingPrefab[0] === BuildingTypeToPrefabTypeMap[STRUCTURE_ROAD]);
    let containerBuildingPrefab = colonyPlanner.rclPrefabs[0]
      .find(buildingPrefab => buildingPrefab[0] === BuildingTypeToPrefabTypeMap[STRUCTURE_CONTAINER]);

    if (!containerBuildingPrefab) {
      containerBuildingPrefab = [BuildingTypeToPrefabTypeMap[STRUCTURE_CONTAINER], []];
      colonyPlanner.rclPrefabs[0].unshift(containerBuildingPrefab);
    }

    const [roadPos, roadEndArrayPos] = this.addPathToTarget(colonyPlanner, roadBuildingPlan, containerBuildingPrefab,
      new RoomPosition(colonyPlanner.center[0], colonyPlanner.center[1], colonyPlanner.room.name), targetEntity.entity.pos, this.range);

    targetEntity.init(roadPos, roadEndArrayPos);
  }

  public static getSourceRoadPlans(colonyPlanner: ColonyPlanner): Array<RoadPlanner> {
    return colonyPlanner.room.find(FIND_SOURCES).map(source => new RoadPlanner(source.id, 1));
  }

  public static getControllerPlan(colonyPlanner: ColonyPlanner): RoadPlanner {
    return new RoadPlanner(colonyPlanner.room.controller.id, 3)
  }

  private addPathToTarget(
    colonyPlanner: ColonyPlanner,
    roadBuildingPlan: BuildingPlan, containerBuildingPlan: BuildingPlan,
    origin: RoomPosition, target: RoomPosition, range: number,
  ): [RoadPos, ArrayPos] {
    const pathFinderPath = PathFinder.search(origin, {pos: target, range}, {
      roomCallback: () => {
        return colonyPlanner.costMatrix;
      }
    });
    const rawRoad = new Array<ArrayPos>();
    let lastPos: ArrayPos;

    pathFinderPath.path.forEach((pos, index) => {
      const arrayPos: ArrayPos = [pos.x, pos.y];
      if (index < pathFinderPath.path.length - 1) rawRoad.push(arrayPos);
      else lastPos = arrayPos;
      colonyPlanner.addBuildingPos(roadBuildingPlan, arrayPos);
    });
    colonyPlanner.addBuildingPos(containerBuildingPlan, [
      pathFinderPath.path[pathFinderPath.path.length - 1].x,
      pathFinderPath.path[pathFinderPath.path.length - 1].y,
    ]);

    const roadPos = colonyPlanner.pathFinder.addRoad(rawRoad);

    return [roadPos, lastPos];
  }
}
