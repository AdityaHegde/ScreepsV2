import {WeightedGroup} from "@wrappers/group/WeightedGroup";
import {JobParams, JobTarget, JobTargetGroupIdx, JobTargetIdIdx} from "./JobParams";
import {BaseClass} from "../../BaseClass";

export class JobNetwork extends BaseClass {
  public readonly sources: Array<WeightedGroup>;
  public readonly targets: Array<WeightedGroup>;
  public readonly resourceType: ResourceConstant;

  public constructor(
    id: string, sources: Array<WeightedGroup>, targets: Array<WeightedGroup>,
    resourceType: ResourceConstant,
  ) {
    super(id);
    this.sources = sources;
    this.targets = targets;
    this.resourceType = resourceType;
  }

  public hasJob(capacity: number): boolean {
    if (!this.sources.some(source => source.hasFreeSingleWeight(capacity))) return false;

    for (const target of this.targets) {
      capacity = target.hasFreeWeight(capacity);
      if (capacity === 0) return true;
    }

    return false;
  }

  public claimJob(capacity: number): JobParams {
    const foundSourceGroup = this.sources.find(source => source.hasFreeSingleWeight(capacity));
    const claimedSource = foundSourceGroup.claimTarget(capacity, true);

    const claimedTargets = new Array<JobTarget>();
    for (const target of this.targets) {
      const [jobTargets, entityWeight] = target.claimTargets(capacity);
      claimedTargets.push(...jobTargets);
      capacity = entityWeight;

      if (capacity === 0) break;
    }

    return [this.resourceType, claimedSource[JobTargetIdIdx], claimedSource[JobTargetGroupIdx], claimedTargets];
  }
}
