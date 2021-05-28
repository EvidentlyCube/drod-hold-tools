import {Hold} from "../data/Hold";
import {Character} from "../data/Character";
import {CharCommand, CommandNameMap} from "../common/Enums";
import {assert} from "../common/Assert";
import {Monster} from "../data/Monster";
import {Room} from "../data/Room";
import {MonsterUtils} from "../common/MonsterUtils";
import {RoomUtils} from "../common/RoomUtils";


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

				default: {
					if (command.speechId) {
						const speech = hold.speeches.get(command.speechId);
						assert(speech, `Failed to find speech ${command.speechId}`);

						speech.linked = `Command ${CommandNameMap.get(command.command)} by Character (${monsterName}) in Level ${level.name} ${coordinate}`;
					}
				}
				break;
			}
		}
	},

};