import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {RoadPos} from "../preprocessing/Prefab";
import {Road} from "./Road";
import {ColonyBaseClass} from "../ColonyBaseClass";

@MemoryClass("pathFinder")
export class PathFinderData extends ColonyBaseClass {
  /**
   * Map from different x/y that are adjacent to RoadPos
   */
  @inMemory(() => {return {}})
  public posToRoadMap: Record<string, Array<RoadPos>>;

  /**
   * Map from different x/y to RoadPos
   */
  @inMemory(() => {return {}})
  public roadPosMap: Record<string, Array<RoadPos>>;

  @inMemory(() => {return {}})
  public creepsInRoad: Record<string, string>;

  @inMemory(() => [])
  public roadIds: Array<string>;
  public roads: Array<Road>;

  public constructor(id: string, room: Room) {
    super(id, room);
    this.roads = this.roadIds.map((roadId, roadIdx) => new Road(roadId, roadIdx));
  }
}
