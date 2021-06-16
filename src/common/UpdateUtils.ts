import {Entrance} from "../data/Entrance";
import {Hold} from "../data/Hold";
import {HoldUtils} from "./HoldUtils";
import {Speech} from "../data/Speech";
import {Scroll} from "../data/Scroll";
import {Level} from "../data/Level";
import {Character} from "../data/Character";
import {Player} from "../data/Player";
import { ChangeUtils } from "./ChangeUtils";
import {DateUtils} from "./DateUtils";

export const UpdateUtils = {
	speechText(speechOrId: Speech|number, newText: string, hold: Hold) {
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

	entranceDescription(entranceOrId: Entrance|number, newDescription: string, hold: Hold) {
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

	scrollText(scrollOrId: Scroll|string, newText: string, hold: Hold) {
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

	levelName(levelOrId: Level|number, newName: string, hold: Hold) {
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

	levelDateCreated(levelOrId: Level|number, newDateCreated: Date, hold: Hold) {
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

	characterName(characterOrId: Character|number, newName: string, hold: Hold) {
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

	playerName(playerOrId: Player|number, newName: string, hold: Hold) {
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
};