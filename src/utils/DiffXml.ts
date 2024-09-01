import { diffArrays } from "./ArrayUtils";
import { parseXml } from "./XmlParser";

type ProgressCallback = (index: number, total: number) => void;

interface AttributeSkip {
	type: 'attribute';
	tagName: string;
	attributeName: string;
}

type Skip = AttributeSkip;

interface DiffState {
	onProgress: ProgressCallback;
	flatDom: Element[];
	skips: Skip[];
}

export async function diffXml(
	left: string | XMLDocument,
	right: string | XMLDocument,
	onProgress: ProgressCallback,
	skips: Skip[] = [],
) {
	left = await toDocument(left);
	right = await toDocument(right);

	const state: DiffState = {
		onProgress,
		skips,
		flatDom: flattenDom(left)
	}

	await compareNode(left, right, "ROOT", state);
}

function flattenDom(document: XMLDocument): Element[] {
	const elements: Element[] = [];

	function traverse(element: Element) {
        elements.push(element);

        for (const child of element.children) {
			traverse(child);
		}
    }

    // Start traversal from the document body
    for (const child of document.children) {
		traverse(child);
	}

    return elements;
}

async function compareNode(left: Node, right: Node, context: string, state: DiffState) {
	await sleep();

	if (left.nodeType !== right.nodeType) {
		throw new Error(`${context}: Node Type '${left.nodeType}'/'${right.nodeType}'`);
	}

	switch (left.nodeType) {
		case Node.ELEMENT_NODE:
			await compareElement(left as Element, right as Element, context, state);
			break;
		case Node.DOCUMENT_NODE:
			await compareDocuments(left as Document, right as Document, context, state);
			break;

		default:
			throw new Error(`Unknown node type: ${left.nodeType}`);
	}
}

async function compareElement(left: Element, right: Element, context: string, state: DiffState) {
	const index = state.flatDom.indexOf(left);
	if (index !== -1) {
		state.onProgress(index, state.flatDom.length);
	}
	if (left.tagName !== right.tagName) {
		console.log(left);
		console.log(right);
		throw new Error(`${context}: Tag Name '${left.tagName}'/'${right.tagName}'`);
	}

	context += "." + left.tagName;

	const leftAttributeNames = Array.from(left.attributes).map(node => node.name);
	const rightAttributeNames = Array.from(right.attributes).map(node => node.name);
	const diffNames = diffArrays(leftAttributeNames, rightAttributeNames);

	if (diffNames.length > 0) {
		throw new Error(`${context}: Attributes names diff '${diffNames.join("','")}'`);
	}

	for (let i = 0; i < left.attributes.length; i++) {
		const lAttr = left.attributes.item(i)!;
		const rAttr = right.attributes.item(i)!;

		if (lAttr.name !== rAttr.name) {
			throw new Error(`${context}.@${i}: Attribute name mismatch '${lAttr.name}' / '${rAttr.name}'`);

		} else if (skipAttribute(left.tagName, lAttr.name, state)) {
			continue;

		} else if (lAttr.value !== rAttr.value) {
			console.log(left);
			console.log(right);
			throw new Error(`${context}.@${i}#${lAttr.name}: Attribute value mismatch ${getStringDiff(lAttr.value, rAttr.value, 32)}`);
		}
	}

	if (left.children.length !== right.children.length) {
		(window as any)._l = left;
		(window as any)._r = right;
		console.log(left);
		console.log(right);
		throw new Error(`${context}: Different children number ${left.children.length} / ${right.children.length}`);
	}

	for (let i = 0; i < left.children.length; i++) {
		await compareNode(left.children[i], right.children[i], `${context}.[${i}]`, state)
	}
}

async function compareDocuments(left: Document, right: Document, context: string, state: DiffState) {
	context += ".document";

	if (left.children.length !== right.children.length) {
		throw new Error(`${context}: Different children number ${left.children.length} / ${right.children.length}`);
	}

	for (let i = 0; i < left.children.length; i++) {
		await compareNode(left.children[i], right.children[i], `${context}.[${i}]`, state)
	}
}

async function toDocument(source: string | Document) {
	if (source instanceof Document) {
		return source;
	}

	return parseXml(source);
}

function getStringDiff(left: string, right: string, context: number) {
	for (let i = 0; i < Math.max(left.length, right.length); i++) {
		if (left.charAt(i) !== right.charAt(i)) {
			let error = `Failure at char #${i}/${left.length},${right.length}:\n`;

			error += `Left:  ${left.slice(Math.max(0, i - context), Math.min(left.length, i + context))}\n`;
			error += `Right: ${right.slice(Math.max(0, i - context), Math.min(right.length, i + context))}`;;

			return error;
		}
	}

	return "Strings are the same";
}

let lastSleep = 0;
async function sleep(forced = false) {
	return new Promise<void>(resolve => {
		if (Date.now() > lastSleep + 16 || forced) {
			setTimeout(() => {
				lastSleep = Date.now();
				resolve();
			}, 100)
		} else {
			resolve();
		}
	})
}

function skipAttribute(tagName: string, attributeName: string, state: DiffState) {
	for (const skip of state.skips) {
		if (skip.type !== 'attribute') {
			continue;
		}
	}
	return (tagName === 'Holds' && attributeName === 'LastUpdated');
}
