import {TerrainMatrix} from "screeps-server-mockup";

export async function getSimpleRoom(server: any, roomName: string): Promise<void> {
  const terrain = new TerrainMatrix();
  [[15, 15], [15, 35], [35, 15], [35, 35]].forEach(([x, y]) => terrain.set(x, y, "wall"));
  for (let i = 0; i < 50; i++) {
    terrain.set(i, 0, "wall");
    terrain.set(i, 49, "wall");
    terrain.set(0, i, "wall");
    terrain.set(49, i, "wall");
  }

  await server.world.addRoom(roomName);
  await server.world.setTerrain(roomName, terrain);
  await server.world.addRoomObject(roomName, "controller", 15, 15, { level: 0 });
  await server.world.addRoomObject(roomName, "source", 15, 35, { energy: 3000, energyCapacity: 3000, ticksToRegeneration: 300 });
  await server.world.addRoomObject(roomName, "source", 35, 15, { energy: 3000, energyCapacity: 3000, ticksToRegeneration: 300 });
  await server.world.addRoomObject(roomName, "mineral", 35, 35, { mineralType: "H", density: 3, mineralAmount: 3000 });
}
