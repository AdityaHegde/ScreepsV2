import {ColonyBaseClass} from "../ColonyBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {PathFinderData} from "./PathFinderData";
import {PathBuilder} from "./PathBuilder";
import {ArrayPos, RoadPos} from "../preprocessing/Prefab";
import {MoveReturnValue, PathNavigator} from "./PathNavigator";
import {inMemory} from "@memory/inMemory";
import {getIdFromRoom} from "../utils/getIdFromRoom";

@MemoryClass("pathFinder")
export class ColonyPathFinder extends ColonyBaseClass {
  public readonly pathFinderData: PathFinderData;
  public readonly pathBuilder: PathBuilder;
  public readonly pathNavigator: PathNavigator;

  public constructor(
    id: string, room: Room, pathFinderData: PathFinderData,
    pathFinderBuilder: PathBuilder, pathNavigator: PathNavigator,
  ) {
    super(id, room);
    // TODO: add composition to this if needed
    this.pathFinderData = pathFinderData;
    this.pathBuilder = pathFinderBuilder;
    this.pathNavigator = pathNavigator;
  }

  public addRoad(rawRoad: Array<ArrayPos>): RoadPos {
    return this.pathBuilder.addRoad(rawRoad);
  }

  public move(creep: Creep, pos: RoomPosition): MoveReturnValue {
    return this.pathNavigator.move(creep, pos);
  }

  public resolveMove(creep: Creep): MoveReturnValue {
    return this.pathNavigator.resolveMove(creep);
  }

  public resolveAndMove(creep: Creep, pos: RoomPosition): MoveReturnValue {
    return this.pathNavigator.resolveAndMove(creep, pos);
  }

  public acquireRoadPos(pos: RoomPosition): RoadPos {
    return this.pathNavigator.acquireRoadPos(pos);
  }

  public static getColonyPathFinder(room: Room): ColonyPathFinder {
    const id = getIdFromRoom(room, "path");
    const pathFinderData = new PathFinderData(id, room);
    const pathBuilder = new PathBuilder(pathFinderData);
    const pathNavigator = new PathNavigator(pathFinderData);
    return new ColonyPathFinder(id, room, pathFinderData, pathBuilder, pathNavigator);
  }
}
