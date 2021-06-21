import {TargetPool, TargetPoolOpts} from "./TargetPool";
import {DepositTarget, DepositTargetType} from "../target/DepositTarget";
import {TargetPoolInstance} from "./TargetPoolInstance";
import {BaseInstanceClass} from "../../BaseInstanceClass";

export class DepositTargetPool<DepositTargetPoolType extends DepositTargetType>
  extends TargetPool<DepositTargetPoolType, DepositTarget> {

  protected structureTypes: Set<StructureConstant>;

  public constructor(
    idSuffix: string, InstanceClazz: typeof BaseInstanceClass,
    opts: TargetPoolOpts<DepositTarget>,
    structureTypes: Array<StructureConstant>,
  ) {
    super(idSuffix, InstanceClazz, opts);
    this.structureTypes = new Set(structureTypes);
  }

  public init(room: Room): void {
    const instance = this.getInstanceFromRoom<TargetPoolInstance<DepositTargetPoolType, DepositTarget>>(room, true)
      .setTarget(this.target);
    room.find(FIND_STRUCTURES, {
      filter: structure => this.structureTypes.has(structure.structureType),
    }).forEach(structure => instance.addTarget(structure as any));
  }

}
