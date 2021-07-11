import {EventEntry} from "../events/EventLoop";
import {ArrayPos, RoadPos} from "../preprocessing/Prefab";
import {RoadConnectionEntry} from "../pathfinder/Road";

declare global {
  interface Memory {
    creepNameId?: number;
    events?: Array<EventEntry>;
  }

  interface RoomMemory {
    initialised: boolean;
    planned: boolean;
  }
}
