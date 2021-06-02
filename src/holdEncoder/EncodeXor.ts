import {EncodeState, EncodeStep} from "./EncoderCommon";

export const getEncodeXor = (): EncodeStep => {
	const BATCH_SIZE = 10000;
	let pointer = 0;

	return {
		name: 'Xor',
		run(state: EncodeState): boolean {
			const to = Math.min(pointer + BATCH_SIZE, state.holdBytes.length);

			for (; pointer < to; pointer++) {
				state.holdBytes[pointer] = state.holdBytes[pointer] ^ 0xFF;
			}

			state.progressFactor = to / state.holdBytes.length;
			return pointer >= state.holdBytes.length;
		},
	};
};