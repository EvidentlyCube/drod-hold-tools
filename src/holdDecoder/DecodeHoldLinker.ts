import {DecodeState, DecodeStep} from "./DecoderCommon";
import {HoldLinker} from "./HoldLinker";

export const getDecodeHoldLinker = (): DecodeStep => {
	return {
		name: 'Link Data',
		run(decoder: DecodeState): boolean {
			const {hold} = decoder;

			for (const character of hold.characters.values()) {
				HoldLinker.linkCharacter(hold, character);
			}

			for (const entrance of hold.entrances.values()) {
				HoldLinker.linkEntranceToLevel(entrance, hold);
			}

			for (const room of hold.rooms.values()) {
				HoldLinker.fixRoomCoordinates(room, hold);
				for (const monster of room.monsters) {
					HoldLinker.linkMonster(hold, monster, room);
				}
				HoldLinker.countRoomCharacters(room);
				hold.counts.monsters += room.monsters.length;
				hold.counts.characters += room.characterCount;
				hold.counts.scrolls += room.scrolls.length
			}

			return true;
		},
	};
};