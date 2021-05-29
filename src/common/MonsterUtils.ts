import {Monster} from "../data/Monster";
import {Hold} from "../data/Hold";
import {MonsterNameMap, MonsterType} from "./Enums";
import {assert} from "./Assert";
import {UINT_MINUS_1} from "./CommonTypes";

export const MonsterUtils = {
	/**
	 * It is a valid situation for a character to point to a role that does not exist, it might've
	 * been deleted and the character never edited in the meantime. So just default to None
	 * if the character type is not found.
	 */
	fixCharacterType(characterType: number, hold: Hold) {
		if (!hold.characters.has(characterType)) {
			return UINT_MINUS_1;
		}

		return characterType;
	},

	getMonsterName(monster: Monster, hold: Hold) {
		const type = monster.type === MonsterType.Character
			? monster.characterType
			: monster.type;

		if (type === UINT_MINUS_1) {
			return "None";
		}

		if (type >= MonsterType._CustomCharactersStart) {
			const character = hold.characters.get(type);
			assert(character, `Failed to find character for type ${type}`);
			return character.name;
		}

		const name = MonsterNameMap.get(type);

		return name || `Unknown Type #${type}`;
	}
}