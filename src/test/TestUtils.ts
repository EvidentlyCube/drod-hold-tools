import fs from "fs";
import {inflate} from "pako";
import {PackedVars} from "../common/PackedVars";
import {PackedVarsUtils} from "../common/PackagedVarsUtils";

export const TestUtils = {
	getHoldString(holdName: string) {
		const path = __dirname + `/assets/${holdName}.hold`;
		const holdBuffer = fs.readFileSync(path);

		for (let i = 0; i < holdBuffer.length; i++) {
			holdBuffer[i] = holdBuffer[i] ^ 0xFF;
		}

		return Array.from(inflate(holdBuffer)).map(x => String.fromCharCode(x)).join('');
	},
	getHoldXml(holdName: string): Document {
		const holdString = TestUtils.getHoldString(holdName);

		const domParser = new DOMParser();
		return domParser.parseFromString(holdString, 'text/xml');
	},

	getAllMonsterCharacters(hold: Document): Element[] {
		return this.getXpath(hold, '//Monsters').filter(x => x.hasAttribute('ExtraVars'));
	},

	getPackedVars(monster: Element): PackedVars {
		return PackedVarsUtils.readBuffer(
			PackedVarsUtils.base64ToArray(monster.getAttribute('ExtraVars')!),
		);
	},

	getXpath(document: Document, xpath: string): Element[] {
		const xPathResult = document.evaluate(xpath, document.firstChild!, null, XPathResult.ANY_TYPE);

		const nodes = [];
		let node = xPathResult.iterateNext();
		while (node) {
			if (node instanceof Element) {
				nodes.push(node);
			}
			node = xPathResult.iterateNext();
		}

		return nodes;
	},
};