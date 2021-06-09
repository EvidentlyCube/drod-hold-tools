import {DecodeState, DecodeStep} from "./DecoderCommon";
import {XmlDecode} from "../common/XmlDecode";
import {StringUtils} from "../common/StringUtils";

export const getDecodeReadToXml = (): DecodeStep => {
	let xmlString: string | undefined = undefined;
	let pointer = 0;
	let decode = new XmlDecode();

	return {
		name: 'Read XML',
		run(state: DecodeState): boolean {
			if (xmlString === undefined) {
				state.progressFactor = 0;
				xmlString = StringUtils.uint8ToString(state.holdBytes);
				return false;

			} else if (xmlString.length === 0) {
				throw new Error("No XML");
			}

			const to = Math.min(pointer + 10000, xmlString.length);
			decode.write(xmlString.substring(pointer, to));
			pointer = to;

			state.progressFactor = pointer / xmlString.length;

			return pointer >= xmlString.length;
		},
		after(state) {
			state.holdXml = decode.xml;
		},
	};
};