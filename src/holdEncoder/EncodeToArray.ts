import {EncodeState, EncodeStep} from "./EncoderCommon";

export const getEncodeToArray = (): EncodeStep => {
	return {
		name: 'Xml to Bytes',
		run(state: EncodeState): boolean {
			const serializer = new XMLSerializer();
			const xmlString = serializer.serializeToString(state.holdXml);
			console.log(state.hold);
			console.log(state.holdXml);
			console.log(xmlString);

			state.holdBytes = new Uint8Array(xmlString.split('').map(x => x.charCodeAt(0)));

			state.progressFactor = -1;
			return true;
		},
	};
};