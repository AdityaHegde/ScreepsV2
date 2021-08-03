import {ControllerImpl} from "@test-utils/game-mocks/impls/ControllerImpl";
import {SourceImpl} from "@test-utils/game-mocks/impls/SourceImpl";

export class RoomImpl implements Room {
  public energyAvailable: number;
  public energyCapacityAvailable: number;
  public memory: RoomMemory;
  public mode: string;
  public readonly name: string;
  public readonly prototype: Room;
  public visual: RoomVisual;

  public controller: ControllerImpl;
  public sources: Array<SourceImpl>;

  public constructor(name: string, controller: ControllerImpl, sources: Array<SourceImpl>) {
    this.name = name;
    this.controller = controller;
    if (controller) {
      controller.room = this;
    }
    this.sources = sources;
    sources?.forEach(source => source.room = this);
  }

  public createConstructionSite(x: number, y: number, structureType: BuildableStructureConstant): ScreepsReturnCode;
  public createConstructionSite(pos: RoomPosition | _HasRoomPosition, structureType: StructureConstant): ScreepsReturnCode;
  public createConstructionSite(x: number, y: number, structureType: STRUCTURE_SPAWN, name?: string): ScreepsReturnCode;
  public createConstructionSite(pos: RoomPosition | _HasRoomPosition, structureType: STRUCTURE_SPAWN, name?: string): ScreepsReturnCode;
  public createConstructionSite(x: number | RoomPosition | _HasRoomPosition, y: number | StructureConstant | STRUCTURE_SPAWN, structureType?: BuildableStructureConstant | STRUCTURE_SPAWN | string, name?: string): ScreepsReturnCode {
    return undefined;
  }

  public createFlag(x: number, y: number, name?: string, color?: ColorConstant, secondaryColor?: ColorConstant): ERR_NAME_EXISTS | ERR_INVALID_ARGS | string;
  public createFlag(pos: RoomPosition | { pos: RoomPosition }, name?: string, color?: ColorConstant, secondaryColor?: ColorConstant): ERR_NAME_EXISTS | ERR_INVALID_ARGS | string;
  public createFlag(x: number | RoomPosition | { pos: RoomPosition }, y?: number | string, name?: string | ColorConstant, color?: ColorConstant, secondaryColor?: ColorConstant): ERR_NAME_EXISTS | ERR_INVALID_ARGS | string {
    return undefined;
  }

  public find<K extends FindConstant>(type: K, opts?: FilterOptions<K>): Array<FindTypes[K]>;
  public find<T extends Structure>(type: FIND_STRUCTURES | FIND_MY_STRUCTURES | FIND_HOSTILE_STRUCTURES, opts?: FilterOptions<FIND_STRUCTURES>): T[];
  public find(type, opts?): any {
    if (type === FIND_SOURCES) return this.sources;
    return [];
  }

  public findExitTo(room: string | Room): ExitConstant | ERR_NO_PATH | ERR_INVALID_ARGS {
    return undefined;
  }

  public findPath(fromPos: RoomPosition, toPos: RoomPosition, opts?: FindPathOpts): PathStep[] {
    return [];
  }

  public getEventLog(raw?: boolean): EventItem[] {
    return [];
  }

  public getPositionAt(x: number, y: number): RoomPosition | null {
    return undefined;
  }

  public getTerrain(): RoomTerrain {
    return undefined;
  }

  public lookAt(x: number, y: number): LookAtResult[];
  public lookAt(target: RoomPosition | { pos: RoomPosition }): LookAtResult[];
  public lookAt(x: number | RoomPosition | { pos: RoomPosition }, y?: number): LookAtResult[] {
    return [];
  }

  public lookAtArea(top: number, left: number, bottom: number, right: number, asArray?: false): LookAtResultMatrix;
  public lookAtArea(top: number, left: number, bottom: number, right: number, asArray: true): LookAtResultWithPos[];
  public lookAtArea(top: number, left: number, bottom: number, right: number, asArray?: boolean): LookAtResultMatrix | LookAtResultWithPos[] {
    return undefined;
  }

  public lookForAt<T extends keyof AllLookAtTypes>(type: T, x: number, y: number): Array<AllLookAtTypes[T]>;
  public lookForAt<T extends keyof AllLookAtTypes>(type: T, target: RoomPosition | _HasRoomPosition): Array<AllLookAtTypes[T]>;
  public lookForAt<T extends keyof AllLookAtTypes>(type, x: number | RoomPosition | _HasRoomPosition, y?: number): Array<AllLookAtTypes[T]> {
    return undefined;
  }

  public lookForAtArea<T extends keyof AllLookAtTypes>(type: T, top: number, left: number, bottom: number, right: number, asArray?: false): LookForAtAreaResultMatrix<AllLookAtTypes[T], T>;
  public lookForAtArea<T extends keyof AllLookAtTypes>(type: T, top: number, left: number, bottom: number, right: number, asArray: true): LookForAtAreaResultArray<AllLookAtTypes[T], T>;
  public lookForAtArea(type, top: number, left: number, bottom: number, right: number, asArray?: boolean): any {
    return undefined;
  }
}