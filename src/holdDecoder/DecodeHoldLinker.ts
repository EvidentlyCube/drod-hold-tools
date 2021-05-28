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

			for (const room of hold.rooms.values()) {
				for (const monster of room.monsters) {
					HoldLinker.linkMonster(hold, monster, room);
				}
			}

			console.log(hold);

			return true;
		},
	};
};