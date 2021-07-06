import {DecodeState, DecodeStep} from "./DecoderCommon";
import {Inflate} from "pako";

export const getDecodeInflate = (): DecodeStep => {
	const BATCH_SIZE = 1024 * 1024;
	const inflater = new Inflate({});
	let pointer = 0;

	return {
		name: 'Inflate',
		run(decoder: DecodeState): boolean {
			const to = Math.min(pointer + BATCH_SIZE, decoder.holdBytes.length);
			const isLast = to === decoder.holdBytes.length;

			inflater.push(new Uint8Array(decoder.holdBytes, pointer, to - pointer), isLast);
			pointer = to;

			decoder.progressFactor = to / decoder.holdBytes.length;
			return to === decoder.holdBytes.length;
		},
		after(decoder) {
			if (inflater.result instanceof Uint8Array) {
				decoder.holdBytes = inflater.result as Uint8Array;

			} else {
				console.error(inflater.result);
				throw new Error("Inflating failed to produce Uint8Array result");
			}
		},
	};
};