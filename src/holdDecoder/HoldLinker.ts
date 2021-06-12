import {Hold} from "../data/Hold";
import {Character} from "../data/Character";
import {CommandNameMap, MonsterType} from "../common/Enums";
import {assert} from "../common/Assert";
import {Monster} from "../data/Monster";
import {Room} from "../data/Room";
import {MonsterUtils} from "../common/MonsterUtils";
import {RoomUtils} from "../common/RoomUtils";
import {Entrance} from "../data/Entrance";
import {Command} from "../data/Command";

export const HoldLinker = {
	linkHold(hold: Hold) {
		const author = hold.players.get(hold.playerId);
		assert(author, `No player found for id '${hold.playerId}'`);

		hold.author = author;
	},
	linkCharacter(hold: Hold, character: Character) {
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

		for (const command of commands) {
			if (command.speechId) {
				const speech = hold.speeches.get(command.speechId);
				assert(speech, `Failed to find speech ${command.speechId}`);

				speech.source = sourceMonster || sourceCharacter;
				speech.command = command;
				speech.location = {
					x: command.x,
					y: command.y,
					commandName: CommandNameMap.get(command.command) ?? `Unknown command #${command.command}`,
					source: sourceMonster ? 'monster' : 'character',
					characterName: MonsterUtils.getMonsterName(monsterType, hold),
					location: room ? RoomUtils.getDisplayLocation(room.roomId, hold) : '',
				};
			}

			switch (command.command) {
				default:
					break;
			}
		}
	},
	linkMonster(hold: Hold, monster: Monster, room: Room) {
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