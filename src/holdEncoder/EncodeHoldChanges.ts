import {EncodeStep} from "./EncoderCommon";
import {HoldEncodeChanges} from "./HoldEncodeChanges";

export const getEncodeHoldChanges = (): EncodeStep => {
	return {
		name: 'Encode Changes',
		run(state): boolean {
			HoldEncodeChanges.hold(state.hold);

			for (const room of state.hold.rooms.values()) {
				HoldEncodeChanges.room(room, state.hold);
			}

			for (const speech of state.hold.speeches.values()) {
				HoldEncodeChanges.speech(speech, state.hold);
			}

			for (const entrance of state.hold.entrances.values()) {
				HoldEncodeChanges.entrance(entrance, state.hold);
			}

			state.holdXml = state.hold.xmlDocument;
			state.progressFactor = 1;
			return true;
		},
	};
};