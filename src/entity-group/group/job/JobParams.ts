export type JobParams = [
  resourceType: ResourceConstant,
  sourceType: number, sourceId: string, sourceEntityPoolId: string,
  targetType: number, targetId: string, targetEntityPoolId: string,
];
export const JobResourceIdx = 0;
export const JobSourceTypeIdx = 1
export const JobSourceIdIdx = 2;
export const JobSourceEntityPoolIdx = 3;
export const JobTargetTypeIdx = 4;
export const JobTargetIdIdx = 5;
export const JobTargetEntityPoolIdx = 6;
