import {DecodeState, DecodeStep} from "./DecoderCommon";
import {decodeHoldNode} from "./HoldDecodeNode";

export const getDecodeToHold = (): DecodeStep => {
	let pointer = 0;
	let children: HTMLCollection;

	return {
		name: 'Read XML',
		run(decoder: DecodeState): boolean {
			if (!children) {
				children = decoder.holdXml.children[0].children;
			}

			if (pointer < children.length) {
				decodeHoldNode(children.item(pointer++)!, decoder.hold);
			}

			decoder.progressFactor = pointer / children.length;
			return pointer === children.length;
		},
		after(decoder) {
			decoder.hold.xmlDocument = decoder.holdXml;
			decoder.hold.isLoaded = true;
		},
	};
};