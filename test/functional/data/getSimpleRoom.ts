import {TerrainMatrix} from "screeps-server-mockup";

export async function getSimpleRoom(server: any, roomName: string): Promise<void> {
  const terrain = new TerrainMatrix();
  [[10, 10], [10, 40], [40, 10], [40, 40]].forEach(([x, y]) => terrain.set(x, y, "wall"));
  for (let i = 0; i < 50; i++) {
    terrain.set(i, 0, "wall");
    terrain.set(i, 49, "wall");
    terrain.set(0, i, "wall");
    terrain.set(49, i, "wall");
  }

  await server.world.addRoom(roomName);
  await server.world.setTerrain(roomName, terrain);
  await server.world.addRoomObject(roomName, "controller", 10, 10, { level: 0 });
  await server.world.addRoomObject(roomName, "source", 10, 40, { energy: 1000, energyCapacity: 1000, ticksToRegeneration: 300 });
  await server.world.addRoomObject(roomName, "source", 40, 10, { energy: 1000, energyCapacity: 1000, ticksToRegeneration: 300 });
  await server.world.addRoomObject(roomName, "mineral", 40, 40, { mineralType: "H", density: 3, mineralAmount: 3000 });
}
