import {Entrance} from "../data/Entrance";
import {Hold} from "../data/Hold";
import {HoldUtils} from "./HoldUtils";
import {Speech} from "../data/Speech";
import {Scroll} from "../data/Scroll";
import {Level} from "../data/Level";

export const ChangeUtils = {
	speechText(speech: Speech, hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Speech",
			model: speech,
			changes: {text: speech.changes.text !== undefined},
		});
	},

	speechDelete(speech: Speech, hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Speech",
			model: speech,
			changes: {delete: speech.isDeleted},
		});

		if (speech.command && speech.source) {
			speech.command.changes.speechId = speech.isDeleted ? 0 : speech.id;

			HoldUtils.addChange(hold, {
				type: "Command",
				model: speech.command,
				source: speech.source,
				changes: {speechId: speech.isDeleted},
			});
		}
	},

	entranceDescription(entrance: Entrance, hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Entrance",
			model: entrance,
			changes: {description: entrance.changes.description !== undefined},
		});
	},

	scrollText(scroll: Scroll, hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Scroll",
			model: scroll,
			changes: {text: scroll.changes.text !== undefined},
		});
	},

	levelName(level: Level, hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Level",
			model: level,
			changes: {name: level.changes.name !== undefined},
		});
	},
};