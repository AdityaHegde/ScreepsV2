import {TerrainMatrix} from "screeps-server-mockup";

export async function getSimpleRoom(server: any, roomName: string): Promise<void> {
  const terrain = new TerrainMatrix();
  [[10, 10], [10, 40], [40, 10], [40, 40]].forEach(([x, y]) => terrain.set(x, y, "wall"));

  await server.world.addRoom(roomName);
  await server.world.setTerrain(roomName, terrain);
  await server.world.addRoomObject(roomName, "controller", 10, 10, { level: 0 });
  await server.world.addRoomObject(roomName, "source", 10, 40, { energy: 1000, energyCapacity: 1000, ticksToRegeneration: 300 });
  await server.world.addRoomObject(roomName, "source", 40, 10, { energy: 1000, energyCapacity: 1000, ticksToRegeneration: 300 });
  await server.world.addRoomObject(roomName, "mineral", 40, 40, { mineralType: "H", density: 3, mineralAmount: 3000 });
}
