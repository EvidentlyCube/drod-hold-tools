import {DecodeState, DecodeStep} from "./DecoderCommon";

export const getDecodeXor = ():DecodeStep => {
	const BATCH_SIZE = 10000;
	let pointer = 0;

	return {
		name: 'Unxor',
		run(decoder: DecodeState): boolean {
			const to = Math.min(pointer + BATCH_SIZE, decoder.holdBytes.length);

			for (;pointer < to; pointer++) {
				decoder.holdBytes[pointer] = decoder.holdBytes[pointer] ^ 0xFF;
			}

			decoder.progressFactor = to / decoder.holdBytes.length;
			return pointer >= decoder.holdBytes.length;
		}
	};
}