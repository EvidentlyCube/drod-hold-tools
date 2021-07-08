import {Hold} from "../data/Hold";
import {Character} from "../data/Character";
import {CharCommand, CommandNameMap, MonsterType} from "../common/Enums";
import {assert} from "../common/Assert";
import {Monster} from "../data/Monster";
import {Room} from "../data/Room";
import {MonsterUtils} from "../common/MonsterUtils";
import {RoomUtils} from "../common/RoomUtils";
import {Entrance} from "../data/Entrance";
import {Command} from "../data/Command";
import {DataLink} from "../data/Data";
import {HoldUtils} from "../common/HoldUtils";
import {Speech} from "../data/Speech";
import {DataUtils} from "../common/DataUtils";

function linkData(hold: Hold, dataId: number, model: DataLink['model'], field: DataLink['field']) {
	if (!dataId) {
		return;
	}

	const data = HoldUtils.getData(dataId, hold);
	const dataLink: DataLink = {model, field, description: ''};
	dataLink.description = DataUtils.describeDataLink(dataLink, hold);
	data.links.push(dataLink);
}

export const HoldLinker = {
	linkHold(hold: Hold) {
		const author = hold.players.get(hold.playerId);
		assert(author, `No player found for id '${hold.playerId}'`);

		hold.author = author;
	},
	linkRoom(hold: Hold, room: Room) {
		linkData(hold, room.customImageDataId, room, 'customImageDataId');
		linkData(hold, room.overheadImageDataId, room, 'overheadImageDataId');
	},
	linkCharacter(hold: Hold, character: Character) {
		linkData(hold, character.tilesDataId, character, 'tilesDataId');
		linkData(hold, character.faceDataId, character, 'faceDataId');
	},
	linkSpeech(hold: Hold, speech: Speech) {
		linkData(hold, speech.dataId, speech, 'dataId');
	},
	linkCommands(hold: Hold, commands: Command[], room: Room | undefined, sourceMonster?: Monster, sourceCharacter?: Character) {
		if (!sourceMonster && !sourceCharacter) {
			throw new Error("linkCommands requires one of source monster or source character but none was given.");
		} else if (sourceMonster && sourceCharacter) {
			throw new Error("linkCommands requires one of source monster or source character but both were given.");
		}

		const monsterBaseType = sourceMonster ? sourceMonster.type : sourceCharacter!.id;
		const monsterExtendedType = sourceMonster ? sourceMonster.characterType : sourceCharacter!.id;
		const monsterType = monsterBaseType === MonsterType.Character
			? monsterExtendedType
			: monsterBaseType;

		for (let i = 0; i < commands.length; i++) {
			const command = commands[i];

			if (command.speechId) {
				const speech = HoldUtils.getSpeech(command.speechId, hold);

				speech.source = sourceMonster || sourceCharacter;
				speech.command = command;
				speech.location = {
					index: i,
					speechCustomX: command.x,
					speechCustomY: command.y,
					commandName: CommandNameMap.get(command.command) ?? `Unknown command #${command.command}`,
					source: sourceMonster ? 'monster' : 'character',
					characterName: MonsterUtils.getMonsterName(monsterType, hold),
					location: room ? RoomUtils.getDisplayLocation(room.roomId, hold) : '',
					levelId: room?.levelId,
					roomId: room?.roomId,
				};
			}

			console.log(CommandNameMap.get(command.command), command);
			switch (command.command) {
				case CharCommand.CC_SetMusic:
				case CharCommand.CC_WorldMapMusic:
					linkData(hold, command.y, command, 'y');
					break;

				case CharCommand.CC_WorldMapImage:
					linkData(hold, command.h, command, 'h');
					break;

				case CharCommand.CC_AmbientSound:
				case CharCommand.CC_AmbientSoundAt:
				case CharCommand.CC_ImageOverlay:
					if (hold.datas.has(command.w)) {
						linkData(hold, command.w, command, 'w');
					}
					break;
			}
		}
	},
	linkMonster(hold: Hold, monster: Monster, room: Room) {
	},
	linkEntrance(hold: Hold, entrance: Entrance) {
		linkData(hold, entrance.dataId, entrance, 'dataId');
	},

	linkEntranceToLevel(entrance: Entrance, hold: Hold) {
		const room = hold.rooms.get(entrance.roomId);
		assert(room, `Failed to find room of id ${entrance.roomId}`);
		const level = hold.levels.get(room.levelId);
		assert(level, `Failed to find level of id ${room.levelId}`);

		if (entrance.isMainEntrance) {
			level.entrances.unshift(entrance);
			level.entranceX = room.roomX;
			level.entranceY = room.roomY;
		} else {
			level.entrances.unshift(entrance);
		}
	},
	fixRoomCoordinates(room: Room, hold: Hold) {
		const level = hold.levels.get(room.levelId);
		assert(level, `Failed to find level of id ${room.levelId}`);
		room.roomX -= level.entranceX;
		room.roomY -= level.entranceY;

	},
	countRoomCharacters(room: Room) {
		room.characterCount = 0;
		for (const monster of room.monsters) {
			room.characterCount += monster.characterType === MonsterType.Character ? 1 : 0;
		}
	},
};