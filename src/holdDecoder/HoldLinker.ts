import {Hold} from "../data/Hold";
import {Character} from "../data/Character";
import {CharCommand, CommandNameMap} from "../common/Enums";
import {assert} from "../common/Assert";
import {Monster} from "../data/Monster";
import {Room} from "../data/Room";
import {MonsterUtils} from "../common/MonsterUtils";
import {RoomUtils} from "../common/RoomUtils";
import {Entrance} from "../data/Entrance";


export const HoldLinker = {
	linkCharacter(hold: Hold, character: Character) {
		for (const command of character.commands) {
			switch (command.command) {
				case CharCommand.CC_Speech:
					const speech = hold.speeches.get(command.speechId);
					assert(speech, `Failed to find speech ${command.speechId}`);
					speech.linked = `${character.name} (Hold Character)`;
					break;
			}
		}
	},
	linkMonster(hold: Hold, monster: Monster, room: Room) {
		const level = hold.levels.get(room.levelId);
		const monsterName = MonsterUtils.getMonsterName(monster, hold);
		const coordinate = RoomUtils.getCoordinateName(room.roomX, room.roomY);

		assert(level, `Failed to find level ${room.levelId}`);

		for (const command of monster.commands) {
			switch (command.command) {
				case CharCommand.CC_Speech: {
					const speech = hold.speeches.get(command.speechId);
					assert(speech, `Failed to find speech ${command.speechId}`);

					speech.linked = `Speech by Character (${monsterName}) in Level ${level.name} ${coordinate}`;
				}
					break;
				case CharCommand.CC_FlashingText: {
					const speech = hold.speeches.get(command.speechId);
					assert(speech, `Failed to find speech ${command.speechId}`);

					speech.linked = `Flashing Text by Character (${monsterName}) in Level ${level.name} ${coordinate}`;
				}
					break;
				case CharCommand.CC_RoomLocationText: {
					const speech = hold.speeches.get(command.speechId);
					assert(speech, `Failed to find speech ${command.speechId}`);

					speech.linked = `Room Location Text by Character (${monsterName}) in Level ${level.name} ${coordinate}`;
				}
					break;

				default:
					if (command.speechId) {
						const speech = hold.speeches.get(command.speechId);
						assert(speech, `Failed to find speech ${command.speechId}`);

						speech.linked = `Command ${CommandNameMap.get(command.command)} by Character (${monsterName}) in Level ${level.name} ${coordinate}`;
					}
					break;
			}
		}
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
};