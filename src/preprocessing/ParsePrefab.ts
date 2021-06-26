import {BuildingPrefab, Prefab} from "./Prefab";
import {
  BuildingPrefabJson, BuildingPrefabTypeToTypeMap,
  BuildingTypeToPrefabTypeMap,
  ParserMetadata, PrefabJson
} from "./ParserMetadata";

export class ParsePrefab {
  private readonly ControllerStructures: typeof CONTROLLER_STRUCTURES;

  public constructor(ControllerStructures: typeof CONTROLLER_STRUCTURES) {
    this.ControllerStructures = ControllerStructures;
  }

  public parse(plan: PrefabJson): Prefab {
    const parseMetadata = new ParserMetadata();
    for (const structureType of BuildingPrefabTypeToTypeMap) {
      if (structureType in plan.buildings) {
        this.forEachBuilding(parseMetadata, structureType, plan.buildings[structureType]);
      }
    }

    parseMetadata.normalize();

    return parseMetadata.prefab;
  }

  private forEachBuilding(
    parseMetadata: ParserMetadata,
    structureType: BuildableStructureConstant, buildingPrefabJson: BuildingPrefabJson,
  ): void {
    // RCL - 1, so that it starts from 0
    let rclIdx = 0;
    parseMetadata.addRcl(0);
    let buildingPrefab: BuildingPrefab;
    for (let i = 0; i < buildingPrefabJson.pos.length; i++) {
      let updated = false;
      while (((rclIdx + 1) in this.ControllerStructures[structureType]) &&
             (i + 1) > this.ControllerStructures[structureType][rclIdx + 1]) {
        rclIdx++;
        parseMetadata.addRcl(rclIdx);
        updated = true;
      }

      if (updated || !buildingPrefab) {
        buildingPrefab = parseMetadata.addPlanForBuilding(rclIdx, BuildingTypeToPrefabTypeMap[structureType]);
      }

      parseMetadata.addPosToBuilding(buildingPrefab, buildingPrefabJson.pos[i]);
    }
  }
}
