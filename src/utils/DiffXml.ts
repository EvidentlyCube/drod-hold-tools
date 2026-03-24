import { Constants } from "../Constants";
import { PackedVar, PackedVarType } from "../data/PackedVars";
import { readPackedVars } from "../data/PackedVarsUtils";
import { diffArraysOneWay } from "./ArrayUtils";
import { base64ToUint8 } from "./StringUtils";
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

interface DiffXmlErrorDetailToPrint {
	type: 'to-print';
	name: string;
	value: string;
}

interface DiffXmlErrorDetailToStore {
	type: 'to-store';
	name: string;
	value: string;
	fileSuffix: string;
}

type DiffXmlErrorDetail = DiffXmlErrorDetailToPrint | DiffXmlErrorDetailToStore;

export class DiffXmlError extends Error {
	public readonly contextOriginal: Node;
	public readonly contextGenerated: Node;

	public readonly details: DiffXmlErrorDetail[];

	public constructor(original: Node, generated: Node, details: DiffXmlErrorDetail[], message: string) {
		super(message);

		this.contextOriginal = original;
		this.contextGenerated = generated;
		this.details = details;

		this.message = message;
	}
}

export async function diffXml(
	original: string | XMLDocument,
	generated: string | XMLDocument,
	onProgress: ProgressCallback,
	skips: Skip[] = [],
) {
	original = await toDocument(original);
	generated = await toDocument(generated);

	const state: DiffState = {
		onProgress,
		skips,
		flatDom: flattenDom(original)
	}

	await compareNode(original, generated, "ROOT", state);
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

async function compareNode(original: Node, generated: Node, context: string, state: DiffState) {
	await sleep();

	if (original.nodeType !== generated.nodeType) {
		throw new DiffXmlError(
			original, generated, [],
			`${context}: Node type in original is '${original.nodeType}' but generated has '${generated.nodeType}'.`
		);
	}

	switch (original.nodeType) {
		case Node.ELEMENT_NODE:
			await compareElement(original as Element, generated as Element, context, state);
			break;

		case Node.DOCUMENT_NODE:
			await compareDocuments(original as Document, generated as Document, context, state);
			break;

		default:
			throw new DiffXmlError(
				original, generated, [],
				`Unknown node type '${original.nodeType}' in original`
			);
	}
}

async function compareElement(original: Element, generated: Element, context: string, state: DiffState) {
	const index = state.flatDom.indexOf(original);
	if (index !== -1) {
		state.onProgress(index, state.flatDom.length);
	}
	if (original.tagName !== generated.tagName) {
		throw new DiffXmlError(
			original, generated, [],
			`${context}: Tag Name mismatch, original is '${original.tagName}' but generated is '${generated.tagName}'`
		)
	}

	context += "=" + original.tagName;

	const originalAttributeNames = Array.from(original.attributes).map(node => node.name);
	const generatedAttributeNames = Array.from(generated.attributes).map(node => node.name);

	// Special hack for v100 because some holds there had this attribute in the wrong place
	if (original.tagName === 'Demos' && original.attributes[0].name === 'DemoID') {
		const value = original.getAttribute('DemoID');
		original.removeAttribute('DemoID');
		original.setAttribute('DemoID', value ?? '');
	}

	const originalUniqueAttributes = diffArraysOneWay(originalAttributeNames, generatedAttributeNames);
	if (originalUniqueAttributes.length > 0) {
		throw new DiffXmlError(
			original, generated, [],
			`${context}: Original contains attributes '${originalUniqueAttributes.join("','")}' that are not present in the generated.`
		);
	}

	const generatedUniqueAttributes = diffArraysOneWay(generatedAttributeNames, originalAttributeNames);
	if (generatedUniqueAttributes.length > 0) {
		throw new DiffXmlError(
			generated, generated, [],
			`${context}: Generated contains attributes '${generatedUniqueAttributes.join("','")}' that are not present in the original.`
		);
	}

	for (let i = 0; i < original.attributes.length; i++) {
		const originalAttr = original.attributes.item(i)!;
		const generatedAttr = generated.attributes.item(i)!;

		if (originalAttr.name !== generatedAttr.name) {
			throw new DiffXmlError(
				original, generated, [],
				`${context}.@${i}: Attribute name mismatch, in original is '${originalAttr.name}'  but in generated is '${generatedAttr.name}'`
			);

		} else if (skipAttribute(original.tagName, originalAttr.name, state)) {
			continue;

		} else if (originalAttr.value !== generatedAttr.value) {
			const extraDetails: DiffXmlErrorDetail[] = [];

			if (originalAttr.name === 'ExtraVars') {
				const originalPackedVars = readPackedVars(originalAttr.value);
				const originalExtraVars = originalPackedVars.vars;
				const generatedPackedVars = readPackedVars(generatedAttr.value);
				const generatedExtraVars = generatedPackedVars.vars;

				if (originalExtraVars.length < generatedExtraVars.length) {
					extraDetails.push({
						type: 'to-print',
						name: 'Different field counts',
						value: `Generated XML has more extra vars by ${generatedExtraVars.length - originalExtraVars.length}`
					});

				} else if (originalExtraVars.length > generatedExtraVars.length) {
					extraDetails.push({
						type: 'to-print',
						name: 'Different field counts',
						value: `Generated XML has fewer extra vars by ${generatedExtraVars.length - originalExtraVars.length}`
					})
				}

				extraDetails.push({
					type: 'to-store',
					name: 'Generated packed vars',
					value: Array.from(base64ToUint8(generatedAttr.value)).map(x => x.toString(16).padStart(2, '0')).join(' '),
					fileSuffix: 'packed-vars-raw.generated'
				})
				extraDetails.push({
					type: 'to-store',
					name: 'Generated packed vars',
					value: generatedPackedVars.toDebugString(),
					fileSuffix: 'packed-vars.generated'
				})
				extraDetails.push({
					type: 'to-store',
					name: 'Original packed vars',
					value: Array.from(base64ToUint8(originalAttr.value)).map(x => x.toString(16).padStart(2, '0')).join(' '),
					fileSuffix: 'packed-vars-raw.original'
				})
				extraDetails.push({
					type: 'to-store',
					name: 'Original packed vars',
					value: originalPackedVars.toDebugString(),
					fileSuffix: 'packed-vars.original'
				})

				const length = Math.max(originalExtraVars.length, generatedExtraVars.length);

				let ii = 0;
				for (; ii < length; ii++) {
					const original = originalExtraVars[ii];
					const generated = generatedExtraVars[ii];

					const hasWrongName = original?.name !== generated?.name;
					const hasWrongValue = original?.value !== generated?.value;
					const hasWrongType = original?.type !== generated?.type;

					if (hasWrongName || hasWrongValue || hasWrongType) {
						if (original) {
							extraDetails.push({
								type: 'to-print',
								name: 'Original',
								value: `[type=${original.type}/${PackedVarType[original.type]}] ${original.name}=${previewPackedVar(original)}`
							});
						} else {
							extraDetails.push({
								type: 'to-print',
								name: 'Original',
								value: `Is missing a field`
							});
						}
						if (generated) {
							extraDetails.push({
								type: 'to-print',
								name: 'Generated',
								value: `[type=${generated.type}/${PackedVarType[generated.type]}] ${generated.name}=${previewPackedVar(generated)}`
							});
						} else {
							extraDetails.push({
								type: 'to-print',
								name: 'Generated',
								value: `Is missing a field`
							});
						}
					}
				}

				if (ii === length) {
					extraDetails.push({
						type: 'to-print',
						name: 'Caused by',
						value: `Extra vars encode to different strings for no discernable reason`
					});
				}
			}

			throw new DiffXmlError(
				original, generated,
				extraDetails,
				`${context}.@${i}#${originalAttr.name}: Attribute value mismatch:`
				+ getStringDiff(originalAttr.value, generatedAttr.value, 32)
			);
		}
	}

	if (original.children.length !== generated.children.length) {
		throw new DiffXmlError(
			original, generated, [],
			`${context}: Different children number original=${original.children.length}, generated=${generated.children.length}`
		)
	}

	for (let i = 0; i < original.children.length; i++) {
		await compareNode(original.children[i], generated.children[i], `${context}.[${i}]`, state)
	}
}

async function compareDocuments(original: Document, generated: Document, context: string, state: DiffState) {
	context += ".document";

	if (original.children.length !== generated.children.length) {
		throw new DiffXmlError(
			original, generated, [],
			`${context}: Different children number, original has ${original.children.length} but generated has ${generated.children.length}`
		);
	}

	for (let i = 0; i < original.children.length; i++) {
		await compareNode(original.children[i], generated.children[i], `${context}.[${i}]`, state)
	}
}

async function toDocument(source: string | Document) {
	if (source instanceof Document) {
		return source;
	}

	return parseXml(source);
}

function getStringDiff(original: string, generated: string, context: number) {
	for (let i = 0; i < Math.max(original.length, generated.length); i++) {
		if (original.charAt(i) !== generated.charAt(i)) {
			let error = `Failure at char #${i}/${original.length},${generated.length}:\n`;

			error += `Original:  ${original.slice(Math.max(0, i - context), Math.min(original.length, i + context))}\n`;
			error += `Generated: ${generated.slice(Math.max(0, i - context), Math.min(generated.length, i + context))}`;;

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
			}, Constants.diffXmlSleep)
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

function previewPackedVar(val: PackedVar) {
	const result = Array.isArray(val.value) && val.type === PackedVarType.ByteBuffer
		?  val.value.map(x => x.toString(16).padStart(2, '0')).join(' ')
		: JSON.stringify(val.value.toString());

	if (result.length > 40) {
		return `${result.substring(0, 32)}... (Total Length=${result.length})`;
	} else {
		return result;
	}
}