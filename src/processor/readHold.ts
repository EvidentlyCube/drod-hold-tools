import { AsyncGunzip, AsyncUnzlib, FlateError } from "fflate";
import { Constants } from "../Constants";
import { Hold } from "../data/datatypes/Hold";
import { HoldChange } from "../data/datatypes/HoldChange";
import { xmlToHold } from "../data/xmlToHold";
import { HoldReadProgressLog, shouldBeUnreachable } from "../utils/Interfaces";
import { parseXml } from "../utils/XmlParser";
import { concatenateUint8Arrays } from "../utils/ArrayUtils";

export enum HoldEncodingType {
	DeflateXor,
	// From TSS 5.2 (TSS_509)
	Gzip,
	// When hold is provided as a string we can't know the method so guess from version if necessary
	Unknown,
}

export type ReadHoldSource =
	| { file: File }
	| { data: Uint8Array }
	| { xmlString: string };

interface ReadHoldResultSuccess {
	isSuccess: true;
	encodingType: HoldEncodingType;
	holdString: string;
	holdXml: XMLDocument;
	hold: Hold;
}

interface ReadHoldResultFailure {
	isSuccess: false;
	encodingType: HoldEncodingType;
	holdString: string | undefined;
	holdXml: XMLDocument | undefined;
	causedBy: Error;
}

export type ReadHoldResult = ReadHoldResultSuccess | ReadHoldResultFailure;

/**
 * Take a hold source and get a fully structured Hold object from it.
 *
 * @param holdReaderId Necessary to match the hold with indexed storage
 * @param source Source of the hold
 * @param holdChanges Array of user made changes
 * @param onProgress Callback to log progress
 * @returns Results of the operation
 */
export async function readHold(
	holdReaderId: number,
	source: ReadHoldSource,
	holdChanges: HoldChange[] = [],
	onProgress?: HoldReadProgressLog
): Promise<ReadHoldResult> {
	let encodingType = HoldEncodingType.Unknown;
	let holdString: string | undefined
	let holdXml: XMLDocument | undefined;
	let hold: Hold | undefined;

	try {
		const result = await readHoldXmlString(source, onProgress);

		if (!result.isSuccess) {
			return {
				isSuccess: false,
				encodingType: result.encodingType,
				holdString: undefined,
				holdXml: undefined,
				causedBy: result.causedBy,
			}
		}

		holdString = result.holdString;
		encodingType = result.encodingType;

		holdXml = await stepParseXml(holdString, onProgress);
		hold = await xmlToHold(
			holdReaderId,
			holdXml,
			holdChanges,
			(step, progressFactor, context) => onProgress?.(`Reading hold -> ${step}`, progressFactor, context)
		);

		return {
			isSuccess: true,
			holdString, holdXml, encodingType, hold
		};

	} catch (e) {
		const error = e instanceof Error
			? e
			: new Error(String(e));

		return {
			isSuccess: false,
			holdString,
			holdXml,
			encodingType,
			causedBy: error,
		}
	}
}

interface ReadHoldXmlStringResultSuccess {
	isSuccess: true;
	encodingType: HoldEncodingType;
	holdString: string;
}

interface ReadHoldXmlStringResultFailure {
	isSuccess: false;
	encodingType: HoldEncodingType;
	causedBy: Error;
}

type ReadHoldXmlStringResult = ReadHoldXmlStringResultSuccess | ReadHoldXmlStringResultFailure;

export async function readHoldXmlString(
	source: ReadHoldSource,
	onProgress?: HoldReadProgressLog
): Promise<ReadHoldXmlStringResult> {
	let encodingType = HoldEncodingType.Unknown;
	let holdString: string | undefined;

	try {
		if ('xmlString' in source) {
			holdString = source.xmlString;

		} else {
			let holdBytes = 'file' in source
				? await stepReadFile(source.file, onProgress)
				: new Uint8Array(source.data);

			encodingType = guessEncodingType(holdBytes);

			switch (encodingType) {
				case HoldEncodingType.DeflateXor:
					holdBytes = await stepXorDecode(holdBytes, onProgress);
					holdBytes = await stepInflate(holdBytes, new AsyncUnzlib(), onProgress);
					break;

				case HoldEncodingType.Gzip:
					holdBytes = await stepInflate(holdBytes, new AsyncGunzip(), onProgress);
					break;

				case HoldEncodingType.Unknown:
					throw new Error(`Unsupported encoding type ${encodingType}`);

				default:
					shouldBeUnreachable(encodingType);
			}

			holdString = await stepBytesToText(holdBytes, onProgress);
		}

		return {
			isSuccess: true,
			encodingType,
			holdString
		};

	} catch (e) {
		const causedBy = e instanceof Error ? e : new Error(String(e));

		return {
			isSuccess: false,
			encodingType,
			causedBy
		}
	}
}


// Steps

async function stepReadFile(file: File, onProgress?: HoldReadProgressLog): Promise<Uint8Array> {
	return new Promise((resolve, reject) => {
		const STEP_NAME = "Reading file";
		onProgress?.(STEP_NAME, 0, "Start");

		const fileReader = new FileReader();
		if (onProgress) {
			fileReader.addEventListener('progress', e => {
				onProgress(STEP_NAME, e.loaded / e.total, "Reading file");
			});
		}

		fileReader.addEventListener('error', () => reject(new Error("Error occurred while reading the file.")));
		fileReader.addEventListener('load', () => {
			const { result } = fileReader;

			if (result instanceof ArrayBuffer) {
				onProgress?.(STEP_NAME, 1, "File read");
				resolve(new Uint8Array(result));

			} else if (typeof result === 'string') {
				reject(new Error('Fatal internal error - file was read into string and not array buffer.'));
			} else {
				reject(new Error('Fatal error - file was read but no data is available.'));
			}
		});

		fileReader.readAsArrayBuffer(file);
	});
}

async function stepXorDecode(bytes: Uint8Array, onProgress?: HoldReadProgressLog): Promise<Uint8Array> {
	const STEP_NAME = "Decoding file";
	onProgress?.(STEP_NAME, 0, "Start");

	const decodedBytes = new Uint8Array(bytes.length);

	let index = 0;
	const length = bytes.length;

	while (index < length) {
		const to = Math.min(length, index + Constants.xmlReader.xorDecodeChunk);

		for (; index < to; index++) {
			decodedBytes[index] = bytes[index] ^ 0xFF;
		}

		if (shouldYieldToUi()) {
			onProgress?.(STEP_NAME, index / length, "Decoding");
			await yieldToUi();
		}
	}

	onProgress?.(STEP_NAME, 1, "Finished");

	return decodedBytes;
}

async function stepInflate(bytes: Uint8Array, inflator: AsyncGunzip | AsyncUnzlib, onProgress?: HoldReadProgressLog): Promise<Uint8Array> {
	return new Promise((resolve, reject) => {
		const STEP_NAME = "Inflating file";
		onProgress?.(STEP_NAME, 0, "Start");

		const compressedSize = bytes.length;
		const chunks: Uint8Array[] = [];

		inflator.ondata = (flateError: FlateError | null, data: Uint8Array, final: boolean) => {
			if (flateError) {
				inflator.terminate();
				reject(flateError);
				return;
			}

			chunks.push(data);

			if (!final) {
				return;
			}

			onProgress?.(STEP_NAME, 1, "Finished");
			resolve(concatenateUint8Arrays(chunks));
		};

		inflator.ondrain = size => onProgress?.(STEP_NAME, size / compressedSize, "Inflating");
		inflator.push(bytes, true);
	});
}
async function stepBytesToText(bytes: Uint8Array, onProgress?: HoldReadProgressLog): Promise<string> {
	const STEP_NAME = "Reading bytes to string";
	onProgress?.(STEP_NAME, 0, "Start");

	let index = 0;
	const length = bytes.length;
	const textPieces: string[] = [];
	const textDecoder = new TextDecoder();

	while (index < length) {
		const to = Math.min(length, index + Constants.xmlReader.textDecodeChunk);

		textPieces.push(textDecoder.decode(
			bytes.subarray(index, to),
			{ stream: to < length }
		));
		index = to;

		if (shouldYieldToUi()) {
			onProgress?.(STEP_NAME, index / length, "Reading");
			await yieldToUi();
		}
	}

	onProgress?.(STEP_NAME, 1, "Finished");

	return textPieces.join('');
}

async function stepParseXml(xmlString: string, onProgress?: HoldReadProgressLog): Promise<XMLDocument> {
	const STEP_NAME = "Parsing string to XML";
	onProgress?.(STEP_NAME, 0, "Start");

	const xml = await parseXml(xmlString, (log, progress) => onProgress?.(STEP_NAME, progress, log));

	onProgress?.(STEP_NAME, 1, "Finished");

	return xml;
}

function guessEncodingType(bytes: Uint8Array): HoldEncodingType {
	if (bytes[0] === 0x1F && bytes[1] === 0x8B) {
		return HoldEncodingType.Gzip;
	} else {
		return HoldEncodingType.DeflateXor;
	}
}

let lastSleep = 0;
function shouldYieldToUi() {
	// Guard to avoid immediately yielding on the first check
	lastSleep = lastSleep || Date.now();

	return lastSleep + Constants.xmlReaderFrameDuration < Date.now();
}
async function yieldToUi() {
	await new Promise<void>(resolve => setTimeout(() => {
		lastSleep = Date.now();
		resolve();
	}, Constants.xmlReaderSleep));
}