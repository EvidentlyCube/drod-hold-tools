import { diffArrays } from "./ArrayUtils";


export function diffXml(left: string|XMLDocument, right: string|XMLDocument) {
	left = toDocument(left);
	right = toDocument(right);

	compareNode(left, right, "ROOT");

	const leftString = new XMLSerializer().serializeToString(left).replace(/<\?.+?\?>/, '').replace(/\r|\n/g, "");
	const rightString = new XMLSerializer().serializeToString(right).replace(/<\?.+?\?>/, '').replace(/\r|\n/g, "");

	for (let i = 0; i < Math.max(leftString.length, rightString.length); i++) {
		if (leftString.charAt(i) !== rightString.charAt(i)) {
			console.log(`Failure at char #${i}`);
			console.log(`Left: ${leftString.slice(Math.max(0, i - 100), Math.min(leftString.length, i + 100))}`);
			console.log(`Right: ${rightString.slice(Math.max(0, i - 100), Math.min(rightString.length, i + 100))}`);
			break;
		}
	}
}

function compareNode(left: Node, right: Node, context: string) {
	if (left.nodeType !== right.nodeType) {
		throw new Error(`${context}: Node Type '${left.nodeType}'/'${right.nodeType}'`);
	}

	switch (left.nodeType) {
		case Node.ELEMENT_NODE:
			compareElement(left as Element, right as Element, context);
			break;
		case Node.DOCUMENT_NODE:
			compareDocuments(left as Document, right as Document, context);
			break;

		default:
			throw new Error(`Unknown node type: ${left.nodeType}`);
	}
}

function compareElement(left: Element, right: Element, context: string) {
	if (left.tagName !== right.tagName) {
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

		} else if (lAttr.value !== rAttr.value) {
			throw new Error(`${context}.@${i}#${lAttr.name}: Attribute value mismatch ${getStringDiff(lAttr.value, rAttr.value, 32)}`);
		}
	}

	if (left.children.length !== right.children.length) {
		throw new Error(`${context}: Different children number ${left.children.length} / ${right.children.length}`);
	}

	for (let i = 0; i < left.children.length; i++) {
		compareNode(left.children[i], right.children[i], `${context}.[${i}]`)
	}
}

function compareDocuments(left: Document, right: Document, context: string) {
	context += ".document";

	if (left.children.length !== right.children.length) {
		throw new Error(`${context}: Different children number ${left.children.length} / ${right.children.length}`);
	}

	for (let i = 0; i < left.children.length; i++) {
		compareNode(left.children[i], right.children[i], `${context}.[${i}]`)
	}
}

function toDocument(source: string|Document) {
	if (source instanceof Document) {
		return source;
	}

	const parser = new DOMParser();
	return parser.parseFromString(source, "text/xml");
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