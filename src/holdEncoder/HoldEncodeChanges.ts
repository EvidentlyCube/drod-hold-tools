import {Hold} from "../data/Hold";
import {Speech} from "../data/Speech";
import {Room} from "../data/Room";
import {Monster} from "../data/Monster";
import {StringUtils} from "../common/StringUtils";
import {Command} from "../data/Command";
import {MonsterType} from "../common/Enums";
import {CommandsUtils} from "../common/CommandsUtils";
import {PackedVarsUtils} from "../common/PackagedVarsUtils";
import {Character} from "../data/Character";
import {Entrance} from "../data/Entrance";
import {Scroll} from "../data/Scroll";
import {Level} from "../data/Level";
import { Player } from "../data/Player";


export const HoldEncodeChanges = {
	hold(hold: Hold) {
		hold.dateUpdated = new Date();
		hold.dataChanges.clear();
		hold.xml.setAttribute('LastUpdated', Math.floor(hold.dateUpdated.getTime() / 1000).toString());

		if (hold.changes.name !== undefined) {
			hold.name = hold.changes.name;
			delete hold.changes.name;

			hold.xml.setAttribute('NameMessage', StringUtils.stringToHoldString(hold.name, 255));
		}
		if (hold.changes.description !== undefined) {
			hold.description = hold.changes.description;
			delete hold.changes.description;

			hold.xml.setAttribute('DescriptionMessage', StringUtils.stringToHoldString(hold.description, 1350));
		}
		if (hold.changes.ending !== undefined) {
			hold.ending = hold.changes.ending;
			delete hold.changes.ending;

			hold.xml.setAttribute('EndHoldMessage', StringUtils.stringToHoldString(hold.ending, 1350));
		}
	},
	player(player: Player, hold: Hold) {
		if (player.isNew) {
			player.xml.setAttribute('GID_OriginalNameMessage', StringUtils.stringToHoldString(player.name));
			player.xml.setAttribute('GID_Created', (Date.now() / 1000 | 0).toString());
			player.xml.setAttribute('LastUpdated', '0');
			player.xml.setAttribute('NameMessage', StringUtils.stringToHoldString(player.name));
			player.xml.setAttribute('ForumName', '0');
			player.xml.setAttribute('ForumPassword', '0');
			player.xml.setAttribute('IsLocal', '0');
			player.xml.setAttribute('PlayerID', player.id.toString());

			// Since the hold author is always the first node this will insert all the
			// new players right after
			hold.xmlDrod.insertBefore(player.xml, hold.xmlDrod.firstElementChild!.nextElementSibling);
		}

		if (player.isDeleted) {
			player.xml.remove();
			hold.players.delete(player.id);
			return;
		}

		if (player.changes.name !== undefined) {
			player.name = player.changes.name;
			delete player.changes.name;

			player.xml.setAttribute('NameMessage', StringUtils.stringToHoldString(player.name));
		}
	},
	room(room: Room, hold: Hold) {
		for (const monster of room.monsters) {
			HoldEncodeChanges.monster(monster, room, hold);
		}
	},
	level(level: Level, hold: Hold) {
		if (level.changes.name !== undefined) {
			level.name = level.changes.name;
			delete level.changes.name;

			level.xml.setAttribute('NameMessage', StringUtils.stringToHoldString(level.name, 255));
		}

		if (level.changes.playerId !== undefined) {
			level.playerId = level.changes.playerId;
			delete level.changes.playerId;
		
			level.xml.setAttribute('PlayerID', level.playerId.toString());
		}

		if (level.changes.dateCreated !== undefined) {
			level.dateCreated = level.changes.dateCreated;
			delete level.changes.dateCreated;

			level.xml.setAttribute('Created', (level.dateCreated.getTime() / 1000).toFixed(0));
		}
	},
	character(character: Character, hold: Hold) {
		let commandsDirty = false;
		for (const command of character.commands) {
			commandsDirty = HoldEncodeChanges.command(command, hold) || commandsDirty;
		}

		let extraVarsDirty = false;
		if (commandsDirty) {
			character.extraVars.writeByteBuffer('Commands', CommandsUtils.writeCommandsBuffer(character.commands));
			extraVarsDirty = true;
		}

		if (extraVarsDirty) {
			const packedVarsBuffer = PackedVarsUtils.writeBuffer(character.extraVars);
			character.xml.setAttribute('ExtraVars', StringUtils.bytesArrToBase64(packedVarsBuffer));
		}

		if (character.changes.name !== undefined) {
			character.name = character.changes.name;
			delete character.changes.name;

			character.xml.setAttribute('CharNameText', StringUtils.stringToHoldString(character.name, 255));
		}
	},
	monster(monster: Monster, room: Room, hold: Hold) {
		let commandsDirty = false;
		for (const command of monster.commands) {
			commandsDirty = HoldEncodeChanges.command(command, hold) || commandsDirty;
		}

		let extraVarsDirty = false;
		if (commandsDirty && monster.type === MonsterType.Character) {
			monster.extraVars.writeByteBuffer('Commands', CommandsUtils.writeCommandsBuffer(monster.commands));
			extraVarsDirty = true;
		}

		if (extraVarsDirty) {
			const packedVarsBuffer = PackedVarsUtils.writeBuffer(monster.extraVars);
			monster.xml.setAttribute('ExtraVars', StringUtils.bytesArrToBase64(packedVarsBuffer));
		}
	},

	command(command: Command, hold: Hold) {
		let wasChanged = false;
		if (command.changes.speechId !== undefined && command.changes.speechId !== command.speechId) {
			command.speechId = command.changes.speechId;
			wasChanged = true;
		}

		delete (command.changes.speechId);

		return wasChanged;
	},

	speech(speech: Speech, hold: Hold) {
		if (speech.isDeleted) {
			speech.xml.remove();
		} else if (speech.changes.text) {
			speech.text = speech.changes.text;
			delete (speech.changes.text);

			speech.xml.setAttribute('Message', StringUtils.stringToHoldString(speech.text, 1024));
		}
	},

	entrance(entrance: Entrance, hold: Hold) {
		if (entrance.changes.description !== undefined) {
			entrance.description = entrance.changes.description;
			delete (entrance.changes.description);

			entrance.xml.setAttribute('DescriptionMessage', StringUtils.stringToHoldString(entrance.description, 1350));
		}
	},

	scroll(scroll: Scroll, hold: Hold) {
		if (scroll.changes.text !== undefined) {
			scroll.text = scroll.changes.text;
			delete (scroll.changes.text);

			scroll.xml.setAttribute('Message', StringUtils.stringToHoldString(scroll.text, 1350));
		}
	},
};
