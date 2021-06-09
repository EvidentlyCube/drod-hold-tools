import {EncodeState, EncodeStep} from "./EncoderCommon";
import {StringUtils} from "../common/StringUtils";

export const getEncodeToArray = (): EncodeStep => {
	return {
		name: 'Xml to Bytes',
		run(state: EncodeState): boolean {
			const serializer = new XMLSerializer();
			const xmlString = serializer.serializeToString(state.holdXml);
			console.log(state.hold);
			console.log(state.holdXml);
			console.log(xmlString);

			state.holdBytes = StringUtils.stringToUint8(xmlString);

			state.progressFactor = -1;
			return true;
		},
	};
};