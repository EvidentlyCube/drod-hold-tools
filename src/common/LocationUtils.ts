import {Hold} from "../data/Hold";
import {Monster} from "../data/Monster";
import {Character} from "../data/Character";
import {ModelType, MonsterType} from "./Enums";
import {RoomUtils} from "./RoomUtils";
import {MonsterUtils} from "./MonsterUtils";
import {Scroll} from "../data/Scroll";
import {Entrance} from "../data/Entrance";
import {Room} from "../data/Room";

export const LocationUtils = {
	getDisplay(source: Monster | Character | Scroll | Entrance | Room | undefined, hold: Hold) {
		if (!source) {
			return "Unknown";
		}

		switch (source.modelType) {
			case ModelType.Room:
				return RoomUtils.getDisplayLocation(source.roomId, hold);

			case ModelType.Character:
				return `Hold Character: ${source.name}`;

			case ModelType.Monster:
				const role = MonsterUtils.getMonsterName(source.characterType, hold);
				const prefix = source.type === MonsterType.Character ? 'Character' : 'Monster';

				return prefix + ' at ' + RoomUtils.getDisplayLocation(source.roomId, hold) + ` (${source.x}, ${source.y}): ${role}`;

			case ModelType.Scroll:
				return RoomUtils.getDisplayLocation(source.roomId, hold) + ` (${source.x}, ${source.y})`;

			case ModelType.Entrance:
				return RoomUtils.getDisplayLocation(source.roomId, hold) + ` (${source.x}, ${source.y})`;
		}
	},
};
