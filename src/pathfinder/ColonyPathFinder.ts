import {ColonyBaseClass} from "../ColonyBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {PathFinderData} from "./PathFinderData";
import {PathBuilder} from "./PathBuilder";
import {ArrayPos, RoadPos} from "../preprocessing/Prefab";
import {MoveReturnValue, PathNavigator} from "./PathNavigator";
import {inMemory} from "@memory/inMemory";
import {getIdFromRoom} from "../utils/getIdFromRoom";
import {CreepWrapper} from "@wrappers/CreepWrapper";

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

  public move(creepWrapper: CreepWrapper, pos: RoomPosition): MoveReturnValue {
    return this.pathNavigator.move(creepWrapper, pos);
  }

  public resolveMove(creepWrapper: CreepWrapper): MoveReturnValue {
    return this.pathNavigator.resolveMove(creepWrapper);
  }

  public resolveAndMove(creepWrapper: CreepWrapper, pos: RoomPosition): MoveReturnValue {
    return this.pathNavigator.resolveAndMove(creepWrapper, pos);
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
