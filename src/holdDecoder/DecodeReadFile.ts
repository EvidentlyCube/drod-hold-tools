import {DecodeState, DecodeStep} from "./DecoderCommon";

export const getDecoderReadFile = (): DecodeStep => {
	const fileReader = new FileReader();
	let data: Uint8Array | undefined;
	let isLoading = false;
	fileReader.onload = () => {
		const buffer = fileReader.result as ArrayBuffer;
		data = new Uint8Array(buffer);
	};

	return {
		name: 'Read File',
		run(decoder: DecodeState): boolean {
			if (!decoder.file) {
				return true;
			}

			if (!isLoading) {
				fileReader.readAsArrayBuffer(decoder.file);
				isLoading = true;
			}

			decoder.progressFactor = -1;

			if (data) {
				decoder.holdBytes = data;
				return true;
			}

			return false;
		},
	};
};