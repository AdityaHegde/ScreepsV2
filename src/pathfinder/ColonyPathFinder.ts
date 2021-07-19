import {ColonyBaseClass} from "../ColonyBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {PathFinderData} from "./PathFinderData";
import {PathBuilder} from "./PathBuilder";
import {PathNavigator} from "./PathNavigator";
import {getIdFromRoom} from "../utils/getIdFromRoom";
import {Traveler} from "@pathfinder/Traveler";
import {DummyPathBuilder} from "@pathfinder/DummyPathBuilder";

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

  public preTick(): void {
    this.pathNavigator.preTick();
  }

  public postTick(): void {
    this.pathNavigator.postTick();
  }

  public static getColonyPathFinder(room: Room): ColonyPathFinder {
    const id = getIdFromRoom(room, "path");
    const pathFinderData = new PathFinderData(id, room);
    const pathBuilder = new PathBuilder(pathFinderData);
    const pathNavigator = new PathNavigator(pathFinderData);
    return new ColonyPathFinder(id, room, pathFinderData, pathBuilder, pathNavigator);
  }

  public static getTravellerColonyPathFinder(room: Room): ColonyPathFinder {
    const id = getIdFromRoom(room, "path");
    const pathFinderData = new PathFinderData(id, room);
    const pathBuilder = new DummyPathBuilder(pathFinderData);
    const pathNavigator = new Traveler(pathFinderData);
    return new ColonyPathFinder(id, room, pathFinderData, pathBuilder, pathNavigator);
  }
}
