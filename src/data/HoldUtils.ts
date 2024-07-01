import { Hold } from "./datatypes/Hold";

export function getLevelRoomIds(hold: Hold, levelId: number): number[] {
	return hold.rooms.filterToArray(room => room.levelId === levelId).map(room => room.id);
}

export function getMainEntranceId(hold: Hold, levelId: number) {
	const roomIds = new Set(getLevelRoomIds(hold, levelId));

	return hold.entrances.find(entrance => entrance.isMainEntrance && roomIds.has(entrance.roomId))?.id;
}