import {Deflate} from "pako";
import {EncodeStep} from "./EncoderCommon";

export const getEncoderDeflate = (): EncodeStep => {
	const BATCH_SIZE = 1024 * 1024;
	const deflater = new Deflate({});
	let pointer = 0;

	return {
		name: 'Deflate',
		run(state): boolean {
			const to = Math.min(pointer + BATCH_SIZE, state.holdBytes.length);
			const isLast = to === state.holdBytes.length;

			deflater.push(new Uint8Array(state.holdBytes, pointer, to - pointer), isLast);
			pointer = to;

			state.progressFactor = to / state.holdBytes.length;
			return to === state.holdBytes.length;
		},
		after(state) {
			if (deflater.result instanceof Uint8Array) {
				state.holdBytes = deflater.result as Uint8Array;

			} else {
				console.error(deflater.result);
				throw new Error("Deflating failed to produce Uint8Array result");
			}
		},
	};
};