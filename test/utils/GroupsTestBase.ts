import {GameMocksTestBase} from "./GameMocksTestBase";
import {ArrayPos} from "../../src/preprocessing/Prefab";
import {CreepImpl} from "./game-mocks/impls/CreepImpl";
import {CreepWrapper} from "@wrappers/CreepWrapper";
import {Globals} from "@globals/Globals";
import {StructureImpl} from "./game-mocks/impls/StructureImpl";
import {GameEntity} from "@wrappers/GameEntity";
import {getIdFromRoom} from "@utils/getIdFromRoom";
import {BUILD_ID, DEPOSIT_ID, SOURCE_ID} from "../../src/constants";
import {getWrapperById} from "@wrappers/getWrapperById";
import {ConstructionSiteImpl} from "./game-mocks/impls/ConstructionSiteImpl";
import {GroupRunner} from "../../src/runner/GroupRunner";
import {ColonyPathFinder} from "@pathfinder/ColonyPathFinder";
import {ControllerImpl} from "./game-mocks/impls/ControllerImpl";
import {ControllerWrapper} from "@wrappers/positions/ControllerWrapper";
import {WeightedGroup} from "@wrappers/group/WeightedGroup";
import {RoomImpl} from "@test-utils/game-mocks/impls/RoomImpl";
import {Entity} from "@wrappers/Entity";
import {deserializePath} from "@test-utils/PathTestUtils";
import {SourceWrapper} from "@wrappers/positions/SourceWrapper";

export class GroupsTestBase extends GameMocksTestBase {
  protected getBasicVars(
    name: string, controllerPos: ArrayPos, controllerInit: [ArrayPos, ArrayPos],
    sourcesPos: Array<ArrayPos>, sourcesInit: Array<[ArrayPos, ArrayPos]>,
  ): { room: RoomImpl, pathFinder: ColonyPathFinder, entities: Array<Entity> } {
    const room = this.gameMocks.getRoom(name,
      controllerPos ? new RoomPosition(controllerPos[0], controllerPos[1], name) : undefined,
      sourcesPos ? sourcesPos.map(sourcePos => new RoomPosition(sourcePos[0], sourcePos[1], name)) : undefined);
    const pathFinder = ColonyPathFinder.getColonyPathFinder(room);
    const entities = new Array<Entity>();
    if (room.controller) {
      const controllerWrapper = new ControllerWrapper(room.controller.id, null, pathFinder);
      entities.push(Globals.addGlobal(controllerWrapper));
      controllerWrapper.init(controllerInit[0], controllerInit[1]);
    }
    if (room.sources) {
      entities.push(...room.sources.map((source, idx) => {
        const sourceWrapper = Globals.addGlobal(new SourceWrapper(source.id, null, pathFinder));
        sourceWrapper.init(sourcesInit[idx][0], sourcesInit[idx][1]);
        return sourceWrapper;
      }));
    }
    return {room, pathFinder, entities};
  }

  protected getCreeps(
    positions: Array<ArrayPos>, room: Room,
    capacityOverride?: Array<number>, powerOverride?: Array<number>,
  ): {creeps: Array<CreepImpl>, creepWrappers: Array<CreepWrapper>} {
    const creeps = new Array<CreepImpl>();
    const creepWrappers = new Array<CreepWrapper>();

    positions.forEach((position, idx) => {
      const creep = this.gameMocks.getCreep(`Creep${idx}`, new RoomPosition(position[0], position[1], room.name),
        {
          carryCount: capacityOverride ? capacityOverride[idx] : 1,
          workCount: powerOverride ? powerOverride[idx] : 1,
        });
      creeps.push(creep);
      const creepWrapper = Globals.addGlobal(CreepWrapper.getEntityWrapper<CreepWrapper>(creep.id));
      creepWrapper.power = powerOverride ? powerOverride[idx] : 1;
      creepWrappers.push(creepWrapper);
    });

    return {creeps, creepWrappers};
  }

  protected getContainers(
    positions: Array<ArrayPos>, capacities: Array<number>, energies: Array<number>,
    isSource: boolean, room: Room,
  ): {containers: Array<StructureImpl>, containerWrappers: Array<GameEntity<StructureImpl>>} {
    const containers = new Array<StructureImpl>();
    const containerWrappers = new Array<GameEntity<StructureImpl>>();
    const id = isSource ? SOURCE_ID : DEPOSIT_ID;
    const weightedGroup = Globals.getGlobal<WeightedGroup>(WeightedGroup, getIdFromRoom(room, id));

    positions.forEach((position, idx) => {
      const container = this.gameMocks.getStructure(`Container-${id}-${idx}`, new RoomPosition(position[0], position[1], room.name), {
        structureType: "container",
        capacity: capacities[idx],
      });
      container.store.addEnergy(energies[idx]);
      containers.push(container);
      const containerWrapper = Globals.addGlobal(getWrapperById(container.id) as GameEntity<StructureImpl>);
      weightedGroup.addWeightedEntity(containerWrapper, isSource ? energies[idx] : capacities[idx] - energies[idx]);
      containerWrappers.push(containerWrapper);
    });

    return {containers, containerWrappers};
  }

  protected getConstructionSites(
    positions: Array<ArrayPos>, types: Array<BuildableStructureConstant>, progressTotals: Array<number>, room: Room,
  ): {constructionSites: Array<ConstructionSiteImpl>, constructionSiteWrappers: Array<GameEntity<ConstructionSiteImpl>>} {
    const constructionSites = new Array<ConstructionSiteImpl>();
    const constructionSiteWrappers = new Array<GameEntity<ConstructionSiteImpl>>();
    const buildTargetGroup = Globals.getGlobal<WeightedGroup>(WeightedGroup, getIdFromRoom(room, BUILD_ID));

    positions.forEach((position, idx) => {
      const constructionSite = this.gameMocks.getConstructionSite(`Construction${idx}`,
        new RoomPosition(position[0], position[1], room.name),
        {structureType: types[idx], progressTotal: progressTotals[idx]});
      constructionSites.push(constructionSite);
      const constructionSiteWrapper = Globals.addGlobal(getWrapperById(constructionSite.id) as GameEntity<ConstructionSiteImpl>);
      buildTargetGroup.addWeightedEntity(constructionSiteWrapper, constructionSite.progressTotal);
      constructionSiteWrappers.push(constructionSiteWrapper);
    });

    return {constructionSites, constructionSiteWrappers};
  }

  protected addPaths(pathFinder: ColonyPathFinder): void {
    pathFinder.pathBuilder.addRoad(deserializePath("01013x9"));
    pathFinder.pathBuilder.addRoad(deserializePath("01014x9"));
    pathFinder.pathBuilder.addRoad(deserializePath("01015x9"));
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
