import {Hold} from "../data/Hold";
import {Monster} from "../data/Monster";
import {Character} from "../data/Character";
import {ModelType} from "./Enums";
import {RoomUtils} from "./RoomUtils";
import {MonsterUtils} from "./MonsterUtils";

export const LocationUtils = {
	getDisplay(source: Monster | Character, hold: Hold) {
		switch (source.modelType) {
			case ModelType.Character:
				return `Hold Character: ${source.name}`;

			case ModelType.Monster:
				const role = MonsterUtils.getMonsterName(source.characterType, hold);
				return RoomUtils.getDisplayLocation(source.roomId, hold) + ` (${source.x}, ${source.y}): ${role}`;
		}

		return "Unknown";
	},
};
