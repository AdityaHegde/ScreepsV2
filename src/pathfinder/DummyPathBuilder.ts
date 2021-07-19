import {PathBuilder} from "@pathfinder/PathBuilder";
import {RoadPos} from "@pathfinder/RoadTypes";
import {ArrayPos} from "../preprocessing/Prefab";

export class DummyPathBuilder extends PathBuilder {
  public addRoad(arrayOfPos: Array<ArrayPos>): RoadPos {
    return null;
  }
}
