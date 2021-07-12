export type RoadPos = [roadIdx: number, roadPosIdx: number, direction?: DirectionConstant];
export const RoadPosRoadIdx = 0;
export const RoadPosRoadPosIdx = 1;
export const RoadPosDirectionIdx = 2;

export type RoadDirection = [forwards: DirectionConstant, backwards: DirectionConstant];
export const RoadForwardsDirectIdx = 0;
export const RoadBackwardsDirectionIdx = 1;

export type RoadConnection = number;

export type RoadIndirectConnection = [roadIdx: number, distance: number];

export type RoadConnectionEntry = [curRoadPosIdx: number, destRoadIdx: number, destRoadConnectionIdx: number];
export const RoadConnectionCurRoadPosIdx = 0;
export const RoadConnectionDestRoadIdx = 1;
export const RoadConnectionDestRoadConnectionIdx = 2;
