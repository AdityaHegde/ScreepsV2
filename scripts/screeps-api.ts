import {ScreepsAPI} from "screeps-api";

(async () => {
  const api = await ScreepsAPI.fromConfig("main");
  console.log(await api.me());
})();
