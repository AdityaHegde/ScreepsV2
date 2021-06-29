export interface RoadIntersection {
  sourceRoadPathIdx: number;
  targetRoadPathIdx: number;
}

export interface RoadIntersections {
  count: number;
  startIdx: number;
  intersections: Array<RoadIntersection>;
}