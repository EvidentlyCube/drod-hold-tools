import {DecodeState, DecodeStep} from "./DecoderCommon";

export const getDecodeReadToXml = ():DecodeStep => {
	return {
		name: 'Read XML',
		run(decoder: DecodeState): boolean {
			decoder.progressFactor = -1;

			const domParser = new DOMParser()
			const xmlString = Array.from(decoder.holdBytes).map(x => String.fromCharCode(x)).join('');
			decoder.holdXml = domParser.parseFromString(xmlString, 'text/xml');

			return true;
		}
	};
}