import {GameMocksTestBase} from "./GameMocksTestBase";
import {ArrayPos} from "../../src/preprocessing/Prefab";
import {CreepImpl} from "./game-mocks/impls/CreepImpl";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {Globals} from "@globals/Globals";
import {StructureImpl} from "./game-mocks/impls/StructureImpl";
import {EntityWrapper} from "@wrappers/EntityWrapper";
import {EntityPool} from "../../src/entity-group/entity-pool/EntityPool";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {BUILD_ID, SOURCE_ID} from "../../src/constants";
import {getWrapperById} from "@wrappers/getWrapperById";
import {ConstructionSiteImpl} from "./game-mocks/impls/ConstructionSiteImpl";
import {GroupRunner} from "../../src/runner/GroupRunner";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {ControllerImpl} from "./game-mocks/impls/ControllerImpl";
import {ControllerWrapper} from "@wrappers/ControllerWrapper";

export class GroupsTestBase extends GameMocksTestBase {
  protected getCreeps(
    positions: Array<ArrayPos>, room: Room,
  ): {creeps: Array<CreepImpl>, creepWrappers: Array<CreepWrapper>} {
    const creeps = new Array<CreepImpl>();
    const creepWrappers = new Array<CreepWrapper>();

    positions.forEach((position, idx) => {
      const creep = this.gameMocks.getCreep(`Creep${idx}`, new RoomPosition(position[0], position[1], room.name));
      creeps.push(creep);
      const creepWrapper = Globals.addGlobal(CreepWrapper.getEntityWrapper<CreepWrapper>(creep.id));
      creepWrapper.power = 1;
      creepWrappers.push(creepWrapper);
    });

    return {creeps, creepWrappers};
  }

  protected getContainers(
    positions: Array<ArrayPos>, energies: Array<number>, room: Room,
  ): {containers: Array<StructureImpl>, containerWrappers: Array<EntityWrapper<StructureImpl>>} {
    const containers = new Array<StructureImpl>();
    const containerWrappers = new Array<EntityWrapper<StructureImpl>>();
    const sourceEntityPool = Globals.getGlobal<EntityPool>(EntityPool as any, getIdFromRoom(room, SOURCE_ID));

    positions.forEach((position, idx) => {
      const container = this.gameMocks.getStructure(`Container${idx}`, new RoomPosition(position[0], position[1], room.name), {
        structureType: "container",
        capacity: energies[idx],
      });
      container.store.addEnergy(energies[idx]);
      containers.push(container);
      const containerWrapper = Globals.addGlobal(getWrapperById(container.id) as EntityWrapper<StructureImpl>);
      sourceEntityPool.addEntityWrapper(containerWrapper, energies[idx]);
      containerWrappers.push(containerWrapper);
    });

    return {containers, containerWrappers};
  }

  protected getConstructionSites(
    positions: Array<ArrayPos>, types: Array<BuildableStructureConstant>, progressTotals: Array<number>, room: Room,
  ): {constructionSites: Array<ConstructionSiteImpl>, constructionSiteWrappers: Array<EntityWrapper<ConstructionSiteImpl>>} {
    const constructionSites = new Array<ConstructionSiteImpl>();
    const constructionSiteWrappers = new Array<EntityWrapper<ConstructionSiteImpl>>();
    const buildEntityPool = Globals.getGlobal<EntityPool>(EntityPool as any, getIdFromRoom(room, BUILD_ID));

    positions.forEach((position, idx) => {
      const constructionSite = this.gameMocks.getConstructionSite(`Construction${idx}`,
        new RoomPosition(position[0], position[1], room.name),
        {structureType: types[idx], progressTotal: progressTotals[idx]});
      constructionSites.push(constructionSite);
      const constructionSiteWrapper = Globals.addGlobal(getWrapperById(constructionSite.id) as EntityWrapper<ConstructionSiteImpl>);
      buildEntityPool.addEntityWrapper(constructionSiteWrapper, constructionSite.progressTotal);
      constructionSiteWrappers.push(constructionSiteWrapper);
    });

    return {constructionSites, constructionSiteWrappers};
  }

  protected getController(position: ArrayPos, room: Room): {controller: ControllerImpl, controllerWrapper: ControllerWrapper} {
    const controller = this.gameMocks.getController("Controller", new RoomPosition(position[0], position[1], room.name));
    const controllerWrapper = Globals.addGlobal(new ControllerWrapper("Controller"));
    room.controller = controller;
    controller.room = room;
    return {controller, controllerWrapper};
  }

  protected runJobGroup(groupRunner: GroupRunner, pathFinder: ColonyPathFinder): void {
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
