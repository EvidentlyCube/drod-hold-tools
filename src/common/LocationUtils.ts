import {Hold} from "../data/Hold";
import {Monster} from "../data/Monster";
import {Character} from "../data/Character";
import {ModelType} from "./Enums";
import {RoomUtils} from "./RoomUtils";
import {MonsterUtils} from "./MonsterUtils";
import {Scroll} from "../data/Scroll";
import {Entrance} from "../data/Entrance";

export const LocationUtils = {
	getDisplay(source: Monster | Character | Scroll | Entrance | undefined, hold: Hold) {
		if (!source) {
			return "Unknown";
		}

		switch (source.modelType) {
			case ModelType.Character:
				return `Hold Character: ${source.name}`;

			case ModelType.Monster:
				const role = MonsterUtils.getMonsterName(source.characterType, hold);
				return RoomUtils.getDisplayLocation(source.roomId, hold) + ` (${source.x}, ${source.y}): ${role}`;

			case ModelType.Scroll:
				return RoomUtils.getDisplayLocation(source.roomId, hold) + ` (${source.x}, ${source.y})`;

			case ModelType.Entrance:
				return RoomUtils.getDisplayLocation(source.roomId, hold) + ` (${source.x}, ${source.y})`;
		}
	},
};
