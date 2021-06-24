import {EncodeState, EncodeStep} from "./EncoderCommon";
import {StringUtils} from "../common/StringUtils";

export const getEncodeToArray = (): EncodeStep => {
	return {
		name: 'Xml to Bytes',
		run(state: EncodeState): boolean {
			const serializer = new XMLSerializer();
			const xmlString = serializer.serializeToString(state.holdXml);

			state.holdBytes = StringUtils.stringToUint8(xmlString);

			state.progressFactor = -1;
			return true;
		},
	};
};