export type JobTarget = [targetId: string, targetGroupId: string, targetWeight: number];
export const JobTargetIdIdx = 0;
export const JobTargetGroupIdx = 1;
export const JobTargetWeightIdx = 2;

export type JobParams = [
  resourceType: ResourceConstant,
  sourceId: string, sourceGroupId: string,
  targets: Array<JobTarget>,
];
export const JobResourceIdx = 0;
export const JobSourceIdIdx = 1;
export const JobSourceGroupIdx = 2;
export const JobTargetsIdx = 3;
