export function getIdFromRoom(room: Room, idSuffix: string): string {
  return `${room.name}-${idSuffix}`;
}
