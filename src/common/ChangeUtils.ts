import {Entrance} from "../data/Entrance";
import {Hold} from "../data/Hold";
import {HoldUtils} from "./HoldUtils";
import {Speech} from "../data/Speech";
import {Scroll} from "../data/Scroll";
import {Level} from "../data/Level";
import {Character} from "../data/Character";
import {Player} from "../data/Player";
import {Data} from "../data/Data";

export const ChangeUtils = {
	speechText(speech: Speech, hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Speech",
			model: speech,
			changes: {text: speech.changes.text !== undefined},
		});
	},

	speechDeleted(speech: Speech, hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Speech",
			model: speech,
			changes: {delete: speech.isDeleted},
		});

		if (speech.source) {
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

	levelPlayerId(level: Level, hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Level",
			model: level,
			changes: {playerId: level.changes.playerId !== undefined},
		});
	},

	levelDateCreated(level: Level, hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Level",
			model: level,
			changes: {dateCreated: level.changes.dateCreated !== undefined},
		});
	},

	characterName(character: Character, hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Character",
			model: character,
			changes: {name: character.changes.name !== undefined},
		});
	},

	holdName(hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Hold",
			model: hold,
			changes: {name: hold.changes.name !== undefined},
		});
	},

	holdDescription(hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Hold",
			model: hold,
			changes: {description: hold.changes.description !== undefined},
		});
	},

	holdEnding(hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Hold",
			model: hold,
			changes: {ending: hold.changes.ending !== undefined},
		});
	},

	removePlayer(player: Player, hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Player",
			model: player,
			changes: {name: false, delete: false, create: false},
		});
	},

	playerName(player: Player, hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Player",
			model: player,
			changes: {name: player.changes.name !== undefined},
		});
	},

	playerCreated(player: Player, hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Player",
			model: player,
			changes: {
				create: player.isNew,
				// Setting these to false so that the whole change record is 
				// removed when a newly created player is deleted
				delete: false,
				name: false
			},
		});
	},

	playerDeleted(player: Player, hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Player",
			model: player,
			changes: {delete: player.isDeleted},
		});
	},

	dataName(data: Data, hold: Hold) {
		HoldUtils.addChange(hold, {
			type: "Data",
			model: data,
			changes: {name: data.changes.name !== undefined},
		});
	},
};