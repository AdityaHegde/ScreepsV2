export type ArrayPos = [x: number, y: number];
export type BuildingPrefab = [
  type: number,
  plans: Array<ArrayPos>,
];
export type RCLPrefab = Array<BuildingPrefab>;
export type Prefab = [
  // distances from center
  // starting top going clockwise until left
  distances: Array<number>,
  rclPrefabs: Array<RCLPrefab>,
];