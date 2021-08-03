import {getIdFromRoom} from "@utils/getIdFromRoom";
import {BUILD_GROUP_ID, BUILD_ID, CONTROLLER_ID, DEPOSIT_ID, HAUL_GROUP_ID, REPAIR_ID, SOURCE_ID} from "../constants";
import {Globals} from "@globals/Globals";
import {JobNetwork} from "@wrappers/group/JobNetwork";
import {WeightedGroup} from "@wrappers/group/WeightedGroup";
import {getWrapperById} from "@wrappers/getWrapperById";

function getSourceGroup(room: Room): WeightedGroup {
  const id = getIdFromRoom(room, SOURCE_ID);
  return Globals.getGlobal(WeightedGroup, id, () =>
    Globals.addGlobal(new WeightedGroup(getIdFromRoom(room, SOURCE_ID), true)));
}

export function getHaulNetworks(room: Room): Array<JobNetwork> {
  const sourceEntityPool = getSourceGroup(room);
  return [
    Globals.addGlobal(new JobNetwork(
      getIdFromRoom(room, HAUL_GROUP_ID),
      [sourceEntityPool],
      [Globals.addGlobal(new WeightedGroup(getIdFromRoom(room, DEPOSIT_ID)))],
      RESOURCE_ENERGY,
    )),
  ];
}

export function getBuildNetworks(room: Room): Array<JobNetwork> {
  const sourceEntityPool = getSourceGroup(room);
  return [
    Globals.addGlobal(new JobNetwork(
      getIdFromRoom(room, BUILD_GROUP_ID),
      [sourceEntityPool],
      [
        Globals.addGlobal(new WeightedGroup(getIdFromRoom(room, BUILD_ID))),
        Globals.addGlobal(new WeightedGroup(getIdFromRoom(room, REPAIR_ID))),
      ],
      RESOURCE_ENERGY,
    )),
  ];
}

export function addSourcesToHaulNetwork(room: Room): void {
  const sourceGroup = Globals.getGlobal<WeightedGroup>(WeightedGroup, getIdFromRoom(room, SOURCE_ID));

  room.find(FIND_SOURCES).forEach(source => sourceGroup.addWeightedEntity(
    getWrapperById(source.id), 0,
  ));
}

export function addControllerToHaulNetwork(room: Room): void {
  const depositGroup = Globals.getGlobal<WeightedGroup>(WeightedGroup, getIdFromRoom(room, DEPOSIT_ID));
  depositGroup.addWeightedEntity(getWrapperById(room.controller.id), 0);
}

export function addToHaulNetwork(room: Room): void {
  addSourcesToHaulNetwork(room);
  addControllerToHaulNetwork(room);
}
