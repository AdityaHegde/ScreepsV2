import {EventEntry} from "../events/EventLoop";
import {ArrayPos} from "../preprocessing/Prefab";
import {TravelData} from "@pathfinder/Traveler";
import {RoadConnectionEntry, RoadPos} from "@pathfinder/RoadTypes";

declare global {
  interface Memory {
    creepNameId?: number;
    events?: Array<EventEntry>;
  }

  interface RoomMemory {
    initialised: boolean;
    planned: boolean;
    avoid: number;
  }

  interface CreepMemory {
    _trav: any;
    _travel: any;
  }
}
