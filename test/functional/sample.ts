import {ScreepsServer} from "screeps-server-mockup";
import {getSimpleRoom} from "./data/getSimpleRoom";
import {readFileSync} from "fs";
import {createLogger, format, transports} from "winston";
import {execSync} from "child_process";

(async () => {
  try {
    execSync("rm logs/out.log");
  } catch (err) {}

  const logger = createLogger({
    level: "debug",
    format: format.simple(),
    transports: [
      new transports.File({ filename: "logs/out.log" }),
    ],
  });

  const server = new ScreepsServer();
  await server.world.reset();

  await getSimpleRoom(server, "W0N1");

  // Add a bot in W0N1
  const modules = {
    main: readFileSync(process.argv[2]).toString(),
  };
  const bot = await server.world.addBot({ username: "bot", room: "W0N1", x: 25, y: 25, modules });
  bot.on("console", (logs, results, userid, username) => {
    logs.forEach(line => logger.debug(`[console|${username}] ${line.join ? line.join(" ") : line}`));
  });

  await server.start();
  for (let i = 0; i < 250; i++) {
    await server.tick();
    const newNotifications = (await bot.newNotifications);
    if (newNotifications.length) console.log("Error in tick", i + 1);
    newNotifications.forEach(({ message }) => console.log(`[notification] ${message.join ? message.join(" ") : message}`));
  }
  const memory: Record<string, any> = JSON.parse(await bot.memory);
  ["entity"].forEach(key => console.log(key, JSON.stringify(memory[key])));
  server.stop();
  process.exit(0);
})();
