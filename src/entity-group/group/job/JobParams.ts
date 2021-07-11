export type JobParams = [
  resourceType: ResourceConstant,
  sourceId: string, sourceEntityPoolId: string,
  targetId: string, targetEntityPoolId: string,
];
export const JobResourceIdx = 0;
export const JobSourceIdIdx = 1;
export const JobSourceEntityPoolIdx = 2;
export const JobTargetIdIdx = 3;
export const JobTargetEntityPoolIdx = 4;
