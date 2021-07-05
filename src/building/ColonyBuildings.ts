import {ColonyBaseClass} from "../ColonyBaseClass";
import {MemoryClass} from "@memory/MemoryClass";
import {inMemory} from "@memory/inMemory";
import {ColonyPlanner} from "../colony-planner/ColonyPlanner";
import {BuildingPrefabTypeToTypeMap} from "../preprocessing/ParserMetadata";
import {EventLoop} from "../events/EventLoop";
import {ConstructionSiteCreatedEventHandler} from "../events/ConstructionSiteCreatedEventHandler";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {COLONY_BUILDINGS_ID} from "../constants";
import {Logger} from "@utils/Logger";

export type ConstructionType = [id: string, x: number, y: number];
export type BuildingType = [id: string, x: number, y: number];

export const MAX_CONCURRENT_SITES = 100;

@MemoryClass("buildings")
export class ColonyBuildings extends ColonyBaseClass {
  public readonly colonyPlanner: ColonyPlanner;

  protected logger = new Logger("ColonyBuildings");

  public constructor(
    id: string, room: Room,
    colonyPlanner: ColonyPlanner,
  ) {
    super(id, room);
    this.colonyPlanner = colonyPlanner;
    this.logger.setRoom(room);
  }

  @inMemory(() => 0)
  public siteCount: number;

  @inMemory(() => 0)
  public buildingCursor: number;
  @inMemory(() => 0)
  public cursor: number;
  @inMemory(() => 0)
  public prevLevel: number;

  public init(): void {
    // nothing
  }

  public run(): void {
    if (this.prevLevel < this.room.controller.level) {
      this.prevLevel = this.room.controller.level;
      this.buildingCursor = 0;
      this.cursor = 0;
    }

    if (this.siteCount <= MAX_CONCURRENT_SITES &&
        this.buildingCursor >= this.colonyPlanner.rclPrefabs[this.room.controller.level - 1].length) {
      return;
    }

    const rclPrefab = this.colonyPlanner.rclPrefabs[this.room.controller.level - 1];
    let buildingPrefab = rclPrefab[this.buildingCursor];
    let structureType = buildingPrefab ? BuildingPrefabTypeToTypeMap[buildingPrefab[0]] : null;
    let count = this.siteCount;

    while (buildingPrefab && count <= MAX_CONCURRENT_SITES) {
      const buildingPos = buildingPrefab[1][this.cursor];
      const result = buildingPos && this.room.createConstructionSite(buildingPos[1][0], buildingPos[1][1], structureType);

      if (result === OK) {
        EventLoop.getEventLoop().addEvent(ConstructionSiteCreatedEventHandler.getEvent(
          this.room.name, structureType, buildingPos[0], buildingPos[1],
        ));
        this.cursor++;
        count++;
      } else if (buildingPos) {
        this.logger.log(`Failed to build ${structureType} at (${buildingPos.join(",")}) result=${result}`);
        break;
      }

      if (this.cursor >= buildingPrefab[1].length) {
        this.buildingCursor++;
        this.cursor = 0;
        buildingPrefab = rclPrefab[this.buildingCursor];
        structureType = buildingPrefab ? BuildingPrefabTypeToTypeMap[buildingPrefab[0]] : null;
      }
    }

    this.siteCount = count;
  }

  public static getColonyBuildings(room: Room, colonyPlanner: ColonyPlanner): ColonyBuildings {
    return new ColonyBuildings(getIdFromRoom(room, COLONY_BUILDINGS_ID), room, colonyPlanner);
  }
}
