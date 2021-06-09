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


export const HoldEncodeChanges = {
	hold(hold: Hold) {
		hold.dateUpdated = new Date();
		hold.changes.clear();
		hold.xml.setAttribute('LastUpdated', Math.floor(hold.dateUpdated.getTime() / 1000).toString());
	},
	room(room: Room, hold: Hold) {
		for (const monster of room.monsters) {
			HoldEncodeChanges.monster(monster, room, hold);
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

			speech.xml.setAttribute('Message', btoa(StringUtils.stringToWString(speech.text)));
		}
	},

	entrance(entrance: Entrance, hold: Hold) {
		if (entrance.changes.description) {
			entrance.description = entrance.changes.description;
			delete (entrance.changes.description);

			entrance.xml.setAttribute('DescriptionMessage', StringUtils.stringToHoldString(entrance.description));
		}
	},
};
