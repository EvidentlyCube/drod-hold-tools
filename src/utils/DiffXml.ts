import { Constants } from "../Constants";
import { areCommandsSame, readCommandsBuffer } from "../data/CommandUtils";
import { PackedVar, PackedVarType } from "../data/PackedVars";
import { readPackedVars } from "../data/PackedVarsUtils";
import { diffArraysOneWay } from "./ArrayUtils";
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

export class DiffXmlError extends Error {
	public readonly contextOriginal: Node;
	public readonly contextGenerated: Node;

	public constructor(original: Node, generated: Node, message: string) {
		super(message);

		this.contextOriginal = original;
		this.contextGenerated = generated;
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
			original, generated,
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
				original, generated,
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
			original, generated,
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
			original, generated,
			`${context}: Original contains attributes '${originalUniqueAttributes.join("','")}' that are not present in the generated.`
		);
	}

	const generatedUniqueAttributes = diffArraysOneWay(generatedAttributeNames, originalAttributeNames);
	if (generatedUniqueAttributes.length > 0) {
		throw new DiffXmlError(
			generated, generated,
			`${context}: Generated contains attributes '${generatedUniqueAttributes.join("','")}' that are not present in the original.`
		);
	}

	for (let i = 0; i < original.attributes.length; i++) {
		const originalAttr = original.attributes.item(i)!;
		const generatedAttr = generated.attributes.item(i)!;

		if (originalAttr.name !== generatedAttr.name) {
			throw new DiffXmlError(
				original, generated,
				`${context}.@${i}: Attribute name mismatch, in original is '${originalAttr.name}'  but in generated is '${generatedAttr.name}'`
			);

		} else if (skipAttribute(original.tagName, originalAttr.name, state)) {
			continue;

		} else if (originalAttr.value !== generatedAttr.value) {
			let extraContexts: string[] = [];
			if (originalAttr.name === 'ExtraVars') {
				const originalExtraVars = readPackedVars(originalAttr.value).vars;
				const generatedExtraVars = readPackedVars(generatedAttr.value).vars;

				if (originalExtraVars.length < generatedExtraVars.length) {
					extraContexts.push(`\n - More generated extra vars by ${generatedExtraVars.length - originalExtraVars.length}`);

				} else if (originalExtraVars.length > generatedExtraVars.length) {
					extraContexts.push(`\n - Fewer generated extra vars by ${originalExtraVars.length - generatedExtraVars.length}`);
				}

				extraContexts.push(`\n - Original value:  ${originalAttr.value}`);
				extraContexts.push(`\n - Generated value: ${generatedAttr.value}`);

				const length = Math.max(originalExtraVars.length, generatedExtraVars.length);

				for (var ii = 0; ii < length; ii++) {
					const original = originalExtraVars[ii];
					const generated = generatedExtraVars[ii];

					const hasWrongName = original?.name !== generated?.name;
					const hasWrongValue = original?.value !== generated?.value;
					const hasWrongType = original?.type !== generated?.type;

					if (hasWrongName || hasWrongValue || hasWrongType) {
						extraContexts.push(`\n - Difference between variables at ${ii}:`);
						if (original) {
							extraContexts.push(`\n   - Original:  [type=${original.type}/${PackedVarType[original.type]}] ${original.name}=${previewPackedVar(original)}`);
						} else {
							extraContexts.push(`\n   - Original has no field`);
						}
						if (generated) {
							extraContexts.push(`\n   - Generated: [type=${generated.type}/${PackedVarType[generated.type]}] ${generated.name}=${previewPackedVar(generated)}`);
						} else {
							extraContexts.push(`\n   - Generated has no field`);
						}

						const sliceStart = Math.max(0, ii - 5);
						const originalSliceEnd = Math.min(originalExtraVars.length, ii + 5);
						const generatedSliceEnd = Math.min(generatedExtraVars.length, ii + 5);

						const originalNames =
							(sliceStart > 0 ? '..., ' : '')
							+ originalExtraVars.slice(sliceStart, originalSliceEnd).map(v => v.name).join(', ')
							+ (originalSliceEnd < originalExtraVars.length ? ', ...' : '');
						const generatedNames =
							(sliceStart > 0 ? '..., ' : '')
							+ generatedExtraVars.slice(sliceStart, generatedSliceEnd).map(v => v.name).join(', ')
							+ (generatedSliceEnd < generatedExtraVars.length ? ', ...' : '');

						extraContexts.push(`\n   - Original variables: ${originalNames}`);
						extraContexts.push(`\n   - Generated variables: ${generatedNames}`);
						break;
					}
				}

				if (ii === length) {
					extraContexts.push(`\n - Extra vars encode to different strings for no discernable reason.`);
					extraContexts.push(`\n - Original = ${base64ToHex(originalAttr.value)}`);
					extraContexts.push(`\n - Generated = ${base64ToHex(generatedAttr.value)}`);
				}
			}

			throw new DiffXmlError(
				original, generated,
				`${context}.@${i}#${originalAttr.name}: Attribute value mismatch:`
				+ getStringDiff(originalAttr.value, generatedAttr.value, 32)
				+ extraContexts.join('')
			);
		}
	}

	if (original.children.length !== generated.children.length) {
		throw new DiffXmlError(
			original, generated,
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
			original, generated,
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

function base64ToHex(base64string: string): string {
	const result = [];
	const str = window.atob(base64string);

	for (let i = 0; i < str.length; i++) {
		result.push(
			str.charCodeAt(i).toString(16).padStart(2, '0')
		);
	}

	return result.join(' ');
}

function previewPackedVar(val: PackedVar) {
	if (Array.isArray(val.value) && val.type === PackedVarType.ByteBuffer) {
		return val.value.map(x => x.toString(16).padStart(2, '0')).join(' ');
	}

	return JSON.stringify(val.value.toString());
}