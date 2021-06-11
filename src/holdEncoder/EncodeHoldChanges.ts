import {EncodeStep} from "./EncoderCommon";
import {HoldEncodeChanges} from "./HoldEncodeChanges";

export const getEncodeHoldChanges = (): EncodeStep => {
	return {
		name: 'Encode Changes',
		run(state): boolean {
			const {hold} = state;
			HoldEncodeChanges.hold(hold);

			for (const level of hold.levels.values()) {
				HoldEncodeChanges.level(level, hold);
			}

			for (const room of hold.rooms.values()) {
				HoldEncodeChanges.room(room, hold);
			}

			for (const speech of hold.speeches.values()) {
				HoldEncodeChanges.speech(speech, hold);
			}

			for (const entrance of hold.entrances.values()) {
				HoldEncodeChanges.entrance(entrance, hold);
			}

			for (const scroll of hold.scrolls.values()) {
				HoldEncodeChanges.scroll(scroll, hold);
			}

			for (const character of hold.characters.values()) {
				HoldEncodeChanges.character(character, hold);
			}

			state.holdXml = hold.xmlDocument;
			state.progressFactor = 1;
			return true;
		},
	};
};