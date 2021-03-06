import {Character} from "../data/Character";
import {Data, DataFormat} from "../data/Data";
import {Entrance} from "../data/Entrance";
import {Hold} from "../data/Hold";
import {Level} from "../data/Level";
import {Player} from "../data/Player";
import {Scroll} from "../data/Scroll";
import {Speech} from "../data/Speech";
import {Store} from "../data/Store";
import {ChangeUtils} from "./ChangeUtils";
import {DateUtils} from "./DateUtils";
import {HoldUtils} from "./HoldUtils";
import {PlayerUtils} from "./PlayerUtils";

const handleAuthorChanged = (level: Level, hold: Hold) => {
	const levelName = level.changes.name ?? level.name;
	const playerId = level.changes.playerId ?? level.playerId;
	const player = HoldUtils.getPlayer(playerId, hold);

	if (player.isDeleted) {
		player.isDeleted = false;
		ChangeUtils.playerDeleted(player, hold);
		Store.addSystemMessage({
			message: <p>
				Player&nbsp;<strong>{PlayerUtils.getName(player)}</strong>&nbsp;is no longer marked
				for deletion, as it's now the author of level&nbsp;<strong>{levelName}</strong>.
			</p>,
			color: "info",
		});
	}
};
export const UpdateUtils = {
	speechText(speechOrId: Speech | number, newText: string, hold: Hold) {
		const speech = typeof speechOrId === 'number'
			? HoldUtils.getSpeech(speechOrId, hold)
			: speechOrId;

		let wasChanged = false;
		if (speech.changes.text !== newText) {
			if (speech.text !== newText) {
				speech.changes.text = newText;
				wasChanged = true;
			} else if (speech.changes.text !== undefined) {
				delete speech.changes.text;
				wasChanged = true;
			}
		}

		if (wasChanged) {
			ChangeUtils.speechText(speech, hold);
		}

		return wasChanged;
	},

	speechDeleted(speechOrId: Speech | number, isDeleted: boolean, hold: Hold) {
		const speech = typeof speechOrId === 'number'
			? HoldUtils.getSpeech(speechOrId, hold)
			: speechOrId;

		let wasChanged = false;
		if (speech.isDeleted !== isDeleted) {
			speech.isDeleted = isDeleted;
			wasChanged = true;
		}

		if (wasChanged) {
			ChangeUtils.speechDeleted(speech, hold);
		}

		return wasChanged;
	},

	entranceDescription(entranceOrId: Entrance | number, newDescription: string, hold: Hold) {
		const entrance = typeof entranceOrId === 'number'
			? HoldUtils.getEntrance(entranceOrId, hold)
			: entranceOrId;

		let wasChanged = false;
		if (entrance.changes.description !== newDescription) {
			if (entrance.description !== newDescription) {
				entrance.changes.description = newDescription;
				wasChanged = true;
			} else if (entrance.changes.description !== undefined) {
				delete entrance.changes.description;
				wasChanged = true;
			}
		}

		if (wasChanged) {
			ChangeUtils.entranceDescription(entrance, hold);
		}

		return wasChanged;
	},

	scrollText(scrollOrId: Scroll | string, newText: string, hold: Hold) {
		const scroll = typeof scrollOrId === 'string'
			? HoldUtils.getScroll(scrollOrId, hold)
			: scrollOrId;

		let wasChanged = false;
		if (scroll.changes.text !== newText) {
			if (scroll.text !== newText) {
				scroll.changes.text = newText;
				wasChanged = true;
			} else if (scroll.changes.text !== undefined) {
				delete scroll.changes.text;
				wasChanged = true;
			}
		}

		if (wasChanged) {
			ChangeUtils.scrollText(scroll, hold);
		}

		return wasChanged;
	},

	levelName(levelOrId: Level | number, newName: string, hold: Hold) {
		const level = typeof levelOrId === 'number'
			? HoldUtils.getLevel(levelOrId, hold)
			: levelOrId;

		let wasChanged = false;
		if (level.changes.name !== newName) {
			if (level.name !== newName) {
				level.changes.name = newName;
				wasChanged = true;
			} else if (level.changes.name !== undefined) {
				delete level.changes.name;
				wasChanged = true;
			}
		}

		if (wasChanged) {
			ChangeUtils.levelName(level, hold);
		}

		return wasChanged;
	},

	levelPlayerId(levelOrId: Level | number, newPlayerId: number, hold: Hold) {
		const level = typeof levelOrId === 'number'
			? HoldUtils.getLevel(levelOrId, hold)
			: levelOrId;

		let wasChanged = false;
		if (level.changes.playerId !== newPlayerId) {
			if (level.playerId !== newPlayerId) {
				level.changes.playerId = newPlayerId;
				wasChanged = true;
			} else if (level.changes.playerId !== undefined) {
				delete level.changes.playerId;
				wasChanged = true;
			}
		}

		if (wasChanged) {
			ChangeUtils.levelPlayerId(level, hold);
			handleAuthorChanged(level, hold);
		}

		return wasChanged;
	},

	levelDateCreated(levelOrId: Level | number, newDateCreated: Date, hold: Hold) {
		const level = typeof levelOrId === 'number'
			? HoldUtils.getLevel(levelOrId, hold)
			: levelOrId;

		let wasChanged = false;
		let newDateIso = DateUtils.formatDate(newDateCreated);
		let oldDateIso = DateUtils.formatDate(level.dateCreated);
		let oldChangedDateIso = level.changes.dateCreated ? DateUtils.formatDate(level.changes.dateCreated) : null;
		if (oldChangedDateIso !== newDateIso) {
			if (oldDateIso !== newDateIso) {
				level.changes.dateCreated = newDateCreated;
				wasChanged = true;
			} else if (level.changes.dateCreated !== undefined) {
				delete level.changes.dateCreated;
				wasChanged = true;
			}
		}

		if (wasChanged) {
			ChangeUtils.levelDateCreated(level, hold);
		}

		return wasChanged;
	},

	characterName(characterOrId: Character | number, newName: string, hold: Hold) {
		const character = typeof characterOrId === 'number'
			? HoldUtils.getCharacter(characterOrId, hold)
			: characterOrId;

		let wasChanged = false;
		if (character.changes.name !== newName) {
			if (character.name !== newName) {
				character.changes.name = newName;
				wasChanged = true;
			} else if (character.changes.name !== undefined) {
				delete character.changes.name;
				wasChanged = true;
			}
		}

		if (wasChanged) {
			ChangeUtils.characterName(character, hold);
		}

		return wasChanged;
	},

	holdName(hold: Hold, newName: string) {
		let wasChanged = false;
		if (hold.changes.name !== newName) {
			if (hold.name !== newName) {
				hold.changes.name = newName;
				wasChanged = true;
			} else if (hold.changes.name !== undefined) {
				delete hold.changes.name;
				wasChanged = true;
			}
		}

		if (wasChanged) {
			ChangeUtils.holdName(hold);
		}

		return wasChanged;
	},

	holdDescription(hold: Hold, newDescription: string) {
		let wasChanged = false;
		if (hold.changes.description !== newDescription) {
			if (hold.description !== newDescription) {
				hold.changes.description = newDescription;
				wasChanged = true;
			} else if (hold.changes.description !== undefined) {
				delete hold.changes.description;
				wasChanged = true;
			}
		}

		if (wasChanged) {
			ChangeUtils.holdDescription(hold);
		}

		return wasChanged;
	},

	holdEnding(hold: Hold, newEnding: string) {
		let wasChanged = false;
		if (hold.changes.ending !== newEnding) {
			if (hold.ending !== newEnding) {
				hold.changes.ending = newEnding;
				wasChanged = true;
			} else if (hold.changes.ending !== undefined) {
				delete hold.changes.ending;
				wasChanged = true;
			}
		}

		if (wasChanged) {
			ChangeUtils.holdEnding(hold);
		}

		return wasChanged;
	},

	playerName(playerOrId: Player | number, newName: string, hold: Hold) {
		const player = typeof playerOrId === 'number'
			? HoldUtils.getPlayer(playerOrId, hold)
			: playerOrId;

		let wasChanged = false;
		if (player.changes.name !== newName) {
			if (player.name !== newName) {
				player.changes.name = newName;
				wasChanged = true;
			} else if (player.changes.name !== undefined) {
				delete player.changes.name;
				wasChanged = true;
			}
		}

		if (wasChanged) {
			ChangeUtils.playerName(player, hold);
		}

		return wasChanged;
	},

	playerDeleted(playerOrId: Player | number, isDeleted: boolean, hold: Hold) {
		const player = typeof playerOrId === 'number'
			? HoldUtils.getPlayer(playerOrId, hold)
			: playerOrId;

		let wasChanged = false;
		if (player.isDeleted !== isDeleted) {
			player.isDeleted = isDeleted;
			wasChanged = true;
		}

		if (wasChanged) {
			ChangeUtils.playerDeleted(player, hold);
		}

		return wasChanged;
	},

	dataName(dataOrId: Data | number, newName: string, hold: Hold) {
		const data = typeof dataOrId === 'number'
			? HoldUtils.getData(dataOrId, hold)
			: dataOrId;

		let wasChanged = false;
		if (data.changes.name !== newName) {
			if (data.name !== newName) {
				data.changes.name = newName;
				wasChanged = true;
			} else if (data.changes.name !== undefined) {
				delete data.changes.name;
				wasChanged = true;
			}
		}

		if (wasChanged) {
			ChangeUtils.dataName(data, hold);
		}

		return wasChanged;
	},

	dataData(dataOrId: Data | number, newData: string, hold: Hold) {
		const data = typeof dataOrId === 'number'
			? HoldUtils.getData(dataOrId, hold)
			: dataOrId;

		let wasChanged = false;
		if (data.changes.data !== newData) {
			if (data.data !== newData) {
				data.changes.data = newData;
				wasChanged = true;
			} else if (data.changes.data !== undefined) {
				delete data.changes.data;
				wasChanged = true;
			}
		}

		if (wasChanged) {
			ChangeUtils.dataData(data, hold);
		}

		return wasChanged;
	},

	dataFormat(dataOrId: Data | number, newFormat: DataFormat, hold: Hold) {
		const data = typeof dataOrId === 'number'
			? HoldUtils.getData(dataOrId, hold)
			: dataOrId;

		let wasChanged = false;
		if (data.changes.format !== newFormat) {
			if (data.format !== newFormat) {
				data.changes.format = newFormat;
				wasChanged = true;
			} else if (data.changes.format !== undefined) {
				delete data.changes.format;
				wasChanged = true;
			}
		}

		if (wasChanged) {
			ChangeUtils.dataFormat(data, hold);
		}

		return wasChanged;
	},
};