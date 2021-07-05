import {RoadPos} from "../../../preprocessing/Prefab";

export type HaulJobParams = [
  source: RoadPos, sourceId: string,
  target: RoadPos, targetId: string,
  resourceType: ResourceConstant,
];
