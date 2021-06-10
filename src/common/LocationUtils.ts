import {Hold} from "../data/Hold";
import {Monster} from "../data/Monster";
import {Character} from "../data/Character";
import {ModelType} from "./Enums";
import {RoomUtils} from "./RoomUtils";
import {MonsterUtils} from "./MonsterUtils";
import {Scroll} from "../data/Scroll";

export const LocationUtils = {
	getDisplay(source: Monster | Character | Scroll, hold: Hold) {
		switch (source.modelType) {
			case ModelType.Character:
				return `Hold Character: ${source.name}`;

			case ModelType.Monster:
				const role = MonsterUtils.getMonsterName(source.characterType, hold);
				return RoomUtils.getDisplayLocation(source.roomId, hold) + ` (${source.x}, ${source.y}): ${role}`;

			case ModelType.Scroll:
				return RoomUtils.getDisplayLocation(source.roomId, hold) + ` (${source.x}, ${source.y})`;
		}

		return "Unknown";
	},
};
