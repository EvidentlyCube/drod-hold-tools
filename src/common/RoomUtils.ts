import {Hold} from "../data/Hold";
import {assert} from "./Assert";

function getXName(x: number) {
	if (x > 0) {
		return x + 'E';
	} else if (x < 0) {
		return -x + "W";
	} else {
		return '';
	}
}

function getYName(y: number) {
	if (y > 0) {
		return y + 'S';
	} else if (y < 0) {
		return -y + "N";
	} else {
		return '';
	}
}

export const RoomUtils = {
	getCoordinateName(x: number, y: number) {
		return (getYName(y) + getXName(x)) || "Entrance";
	},
	getDisplayLocation(roomId: number, hold: Hold) {
		const room = hold.rooms.get(roomId);
		assert(room, `Failed to find room with ID '${roomId}'`);
		const level = hold.levels.get(room.levelId);
		assert(level, `Failed to find level with ID '${room.levelId}'`);

		const coordinate = RoomUtils.getCoordinateName(room.roomX, room.roomY);

		return `${level.name} ${coordinate}`;
	},
};
