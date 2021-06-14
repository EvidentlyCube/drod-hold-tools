import {DecodeState, DecodeStep} from "./DecoderCommon";
import {decodeHoldNode} from "./HoldDecodeNode";

export const getDecodeToHold = (): DecodeStep => {
	let pointer = 0;
	let children: HTMLCollection;

	return {
		name: 'Read XML',
		run(decoder: DecodeState): boolean {
			if (!children) {
				const drodElement = decoder.holdXml.firstElementChild;
				if (!drodElement) {
					throw new Error("No hold data found");
				} else if (drodElement.tagName !== 'drod') {
					throw new Error(`Root node must be <drod> but got <${drodElement.tagName}> instead.`)
				}
				
				decoder.hold.xmlDrod = drodElement;
				decoder.hold.xmlDocument = decoder.holdXml;
				children = drodElement.children;
			}

			if (pointer < children.length) {
				decodeHoldNode(children.item(pointer++)!, decoder.hold);
			}

			decoder.progressFactor = pointer / children.length;
			return pointer === children.length;
		},
		after(decoder) {
			decoder.hold.isLoaded = true;
		},
	};
};