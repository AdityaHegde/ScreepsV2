// converting json from build planner https://screeps.admon.dev/building-planner to usable memory object

import {ParsePrefab} from "../src/preprocessing/ParsePrefab";
import {PrefabJson} from "../src/preprocessing/ParserMetadata";
import {promises} from "fs";
import path from "path";

(async () => {
  const parser = new ParsePrefab(CONTROLLER_STRUCTURES);

  await Promise.all((await promises.readdir(process.argv[2])).map(async (jsonFile) => {
    if (!jsonFile.endsWith(".json")) {
      return;
    }
    const rootName = path.basename(jsonFile, ".json");

    const plan = JSON.parse((await promises.readFile(`${process.argv[2]}/${jsonFile}`)).toString()) as PrefabJson;
    const parsedPlan = parser.parse(plan);
    await promises.writeFile(`${process.argv[3]}/${rootName}.ts`, `export const ${rootName}Prefab = ${JSON.stringify(parsedPlan)}`);
  }));
})();
