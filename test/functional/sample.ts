import {ScreepsServer} from "screeps-server-mockup";
import {getSimpleRoom} from "./data/getSimpleRoom";
import {readFileSync} from "fs";

(async () => {
  const server = new ScreepsServer();
  await server.world.reset();

  await getSimpleRoom(server, "W0N1");

  // Add a bot in W0N1
  const modules = {
    main: readFileSync(process.argv[2]).toString(),
  };
  const bot = await server.world.addBot({ username: "bot", room: "W0N1", x: 25, y: 25, modules });
  bot.on("console", (logs, results, userid, username) => {
    logs.forEach(line => console.log(`[console|${username}]`, line));
  });

  await server.start();
  for (let i = 0; i < 1000; i++) {
    await server.tick();
    (await bot.newNotifications).forEach(({ message }) => console.log("[notification]", message));
  }
  console.log("[memory]", await bot.memory, "\n");
  server.stop();
  process.exit(0);
})();
