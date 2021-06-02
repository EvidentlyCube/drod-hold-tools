import {EncodeStep} from "./EncoderCommon";

export const getEncoderBlobify = (): EncodeStep => {
	return {
		name: 'Blobify',
		run(state): boolean {
			state.holdBlob = new Blob([state.holdBytes]);
			state.progressFactor = 1;
			return true;
		},
	};
};