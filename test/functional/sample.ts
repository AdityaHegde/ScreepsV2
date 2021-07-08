import {ScreepsServer} from "screeps-server-mockup";
import {getSimpleRoom} from "./data/getSimpleRoom";
import {readFileSync} from "fs";
import {createLogger, format, transports} from "winston";
import {execSync} from "child_process";

(async () => {
  execSync("rm logs/out.log");

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
  for (let i = 0; i < 1000; i++) {
    await server.tick();
    const newNotifications = (await bot.newNotifications)
    newNotifications.forEach(({ message }) => console.log(`[notification] ${message.join ? message.join(" ") : message}`));
    if (newNotifications.length > 0) {
      break;
    }
  }
  console.log("[memory]", await bot.memory);
  server.stop();
  process.exit(0);
})();
