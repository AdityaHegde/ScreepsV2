import {RoadPos} from "@pathfinder/RoadTypes";

export type ArrayPos = [x: number, y: number, roomName?: string];

export type BuildingPos = [Array<RoadPos>, ArrayPos];
export type BuildingPrefab = [
  type: number,
  plans: Array<BuildingPos>,
];
export type BuildingPlan = [
  type: number,
  plans: Array<ArrayPos>,
];
export type RCLPrefab = Array<BuildingPrefab>;
export type Prefab = [
  // distances from center
  // starting top going clockwise until left
  distances: Array<number>,
  rclPrefabs: Array<RCLPrefab>,
  roads: Array<Array<ArrayPos>>,
];