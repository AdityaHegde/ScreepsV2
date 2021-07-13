import {GameMocksTestBase} from "../utils/GameMocksTestBase";
import {getBuildGroup} from "../../src/factory/groupsFactory";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {getBuildNetworks} from "../../src/factory/jobNetworkFactory";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {Globals} from "@globals/Globals";
import {deserializePath} from "../utils/PathTestUtils";
import {getWrapperById} from "@wrappers/getWrapperById";
import {EntityPool} from "../../src/entity-group/entity-pool/EntityPool";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {BUILD_ID, SOURCE_ID} from "../../src/constants";
import {StructureImpl} from "../utils/game-mocks/impls/StructureImpl";
import {GroupRunner} from "../../src/runner/GroupRunner";
import {EntityWrapper, StoreEntityType} from "@wrappers/EntityWrapper";

@GameMocksTestBase.Suite
export class BuildJobGroupTest extends GameMocksTestBase {
  @GameMocksTestBase.Test()
  public shouldBuildStructures(): void {
    const room = new Room("r");
    const pathFinder = ColonyPathFinder.getColonyPathFinder(room);
    const buildJobGroup = getBuildGroup(room, pathFinder, getBuildNetworks(room));
    const groupRunner = new GroupRunner("r", room, [buildJobGroup], null);

    this.runJobGroup(groupRunner, pathFinder);

    const creepWrappers = new Array<CreepWrapper>();
    for (let i = 0; i < 3; i++) {
      this.gameMocks.getCreep(`C${i}`, new RoomPosition(1 + (i % 2 === 0 ? 1 : 0), i + 1, room.name));
      const creepWrapper = Globals.addGlobal(CreepWrapper.getEntityWrapper<CreepWrapper>(`C${i}`));
      creepWrapper.power = 1;
      creepWrappers.push(creepWrapper);
      buildJobGroup.addEntityWrapper(creepWrapper);
    }

    const container = this.gameMocks.getStructure("container", new RoomPosition(1, 1, room.name), {
      structureType: "container",
      capacity: CARRY_CAPACITY * 10,
    }) as StructureImpl;
    container.store.addEnergy(CARRY_CAPACITY * 10);
    const containerWrapper = Globals.addGlobal(getWrapperById(container.id) as EntityWrapper<StoreEntityType>);
    const sourceEntityPool = Globals.getGlobal<EntityPool>(EntityPool as any, getIdFromRoom(room, SOURCE_ID));
    sourceEntityPool.addEntityWrapper(containerWrapper, CARRY_CAPACITY * 10);

    const constructionSites = [
      this.gameMocks.getConstructionSite("con1", new RoomPosition(1, 7, room.name), {
        structureType: "container", progressTotal: 160,
      }),
      this.gameMocks.getConstructionSite("con2", new RoomPosition(7, 7, room.name), {
        structureType: "container", progressTotal: 200,
      }),
      this.gameMocks.getConstructionSite("con3", new RoomPosition(7, 1, room.name), {
        structureType: "road", progressTotal: 25,
      }),
    ];
    const constructionSiteWrappers = constructionSites.map(constructionSite =>
      Globals.addGlobal(getWrapperById(constructionSite.id)));
    const buildEntityPool = Globals.getGlobal<EntityPool>(EntityPool as any, getIdFromRoom(room, BUILD_ID));
    constructionSiteWrappers.map(constructionSiteWrapper =>
      buildEntityPool.addEntityWrapper(constructionSiteWrapper, (constructionSiteWrapper.entity as any).progressTotal));

    pathFinder.pathBuilder.addRoad(deserializePath("01013x9"));
    pathFinder.pathBuilder.addRoad(deserializePath("01014x9"));
    pathFinder.pathBuilder.addRoad(deserializePath("01015x9"));

    for (let i = 0; i < 20; i++) {
      creepWrappers.forEach(creepWrapper => creepWrapper.updateEntity(Game.getObjectById(creepWrapper.id)));
      this.runJobGroup(groupRunner, pathFinder);
      constructionSites.forEach((constructionSite, idx) => {
        if (constructionSite.progress >= constructionSite.progressTotal) {
          this.gameMocks.destroy(constructionSite);
        }
        constructionSiteWrappers[idx].updateEntity(Game.getObjectById(constructionSite.id));
      });
    }
  }

  private runJobGroup(groupRunner: GroupRunner, pathFinder: ColonyPathFinder) {
    Game.time++;
    this.gameMocks.gameGlobals.preTick();
    pathFinder.preTick();
    groupRunner.preTick();
    groupRunner.tick();
    pathFinder.postTick();
    groupRunner.postTick();
    this.gameMocks.gameGlobals.postTick();
  }
}
