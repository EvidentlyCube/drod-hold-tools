import { AsyncGunzip, AsyncUnzlib, FlateError } from "fflate";
import { Constants } from "../Constants";
import { Hold } from "../data/datatypes/Hold";
import { HoldChange } from "../data/datatypes/HoldChange";
import { xmlToHold } from "../data/xmlToHold";
import { shouldBeUnreachable } from "../utils/Interfaces";
import { parseXml } from "../utils/XmlParser";

export enum HoldEncodingType {
	DeflateXor,
	// From TSS 5.2 (TSS_509)
	Gzip,
	// When hold is provided as a string we can't know the method so guess from version if necessary
	None,
}

type HoldSource =
	| { file: File }
	| { data: Uint8Array }
	| { xmlString: string };

export type OnProgressCallback = (step: string, progressFactor: number, context: string) => void;

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

type ReadHoldResult = ReadHoldResultSuccess | ReadHoldResultFailure;

export async function readHold(
	id: number,
	source: HoldSource,
	holdChanges: HoldChange[] = [],
	onProgress?: OnProgressCallback
): Promise<ReadHoldResult> {
	let encodingType = HoldEncodingType.None;
	let holdBytes: Uint8Array | undefined;
	let holdString: string | undefined;
	let holdXml: XMLDocument | undefined;
	let hold: Hold | undefined;

	try {
		if ('xmlString' in source) {
			holdString = source.xmlString;

		} else {
			if ('file' in source) {
				holdBytes = await stepReadFile(source.file, onProgress);

			} else {
				holdBytes = new Uint8Array(source.data);
			}

			encodingType = guessEncodingType(holdBytes);

			switch (encodingType) {
				case HoldEncodingType.DeflateXor:
					holdBytes = await stepXorDecode(holdBytes, onProgress);
					holdBytes = await stepInflate(holdBytes, new AsyncUnzlib(), onProgress);
					break;

				case HoldEncodingType.Gzip:
					holdBytes = await stepInflate(holdBytes, new AsyncGunzip(), onProgress);
					break;

				case HoldEncodingType.None:
				default:
					throw new Error(`Unsupported encoding type ${encodingType}`);
			}

			holdString = await stepBytesToText(holdBytes, onProgress);
		}

		holdXml = await stepParseXml(holdString, onProgress);
		hold = await xmlToHold(
			id,
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

// Steps

async function stepReadFile(file: File, onProgress?: OnProgressCallback): Promise<Uint8Array> {
	return new Promise((resolve, reject) => {
		const STEP_NAME = "Reading file";
		onProgress?.(STEP_NAME, 0, "Start");

		const fileReader = new FileReader();
		if (onProgress) {
			fileReader.addEventListener('progress', e => {
				onProgress(STEP_NAME, e.loaded / e.total, "Reading file");
			});
		}

		fileReader.addEventListener('error', e => reject(new Error("Error occurred while reading the file.")));
		fileReader.addEventListener('load', () => {
			const { result } = fileReader;

			if (result instanceof ArrayBuffer) {
				onProgress?.(STEP_NAME, 1, "File read");
				resolve(new Uint8Array(result));

			} else if (typeof result === 'string') {
				reject('Fatal internal error - file was read into string and not array buffer.');
			} else {
				reject('Fatal error - file was read but no data is available.');
			}
		});

		fileReader.readAsArrayBuffer(file);
	});
}

async function stepXorDecode(bytes: Uint8Array, onProgress?: OnProgressCallback): Promise<Uint8Array> {
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

async function stepInflate(bytes: Uint8Array, inflator: AsyncGunzip | AsyncUnzlib, onProgress?: OnProgressCallback): Promise<Uint8Array> {
	return new Promise((resolve, reject) => {
		const STEP_NAME = "Inflating file";
		onProgress?.(STEP_NAME, 0, "Start");

		const compressedSize = bytes.length;

		inflator.ondata = (flateError: FlateError | null, data: Uint8Array, final: boolean) => {
			if (flateError) {
				inflator.terminate();
				reject(flateError);
				return;
			}

			if (!final) {
				return;
			}

			onProgress?.(STEP_NAME, 1, "Finished");
			resolve(data);
		};

		inflator.ondrain = size => onProgress?.(STEP_NAME, size / compressedSize, "Inflating");
		inflator.push(bytes, true);
	});
}
async function stepBytesToText(bytes: Uint8Array, onProgress?: OnProgressCallback): Promise<string> {
	const STEP_NAME = "Reading bytes to string";
	onProgress?.(STEP_NAME, 0, "Start");

	let index = 0;
	const length = bytes.length;
	const textPieces: string[] = [];
	const textDecoder = new TextDecoder();

	while (index < length) {
		const to = Math.min(length, index + Constants.xmlReader.textDecodeChunk);

		textPieces.push(textDecoder.decode(bytes.subarray(index, to)));
		index = to;

		if (shouldYieldToUi()) {
			onProgress?.(STEP_NAME, index / length, "Reading");
			await yieldToUi();
		}
	}

	onProgress?.(STEP_NAME, 1, "Finished");

	return textPieces.join('');
}

async function stepParseXml(xmlString: string, onProgress?: OnProgressCallback): Promise<XMLDocument> {
	const STEP_NAME = "Parsing string to XML";
	onProgress?.(STEP_NAME, 0, "Start");

	const xml = await parseXml(xmlString, (log, progress) => onProgress?.(STEP_NAME, progress, log));

	onProgress?.(STEP_NAME, 1, "Finished");

	return xml;
}

function guessEncodingType(bytes: Uint8Array): HoldEncodingType {
	if (bytes[0] === 0x1F && bytes[1] == 0x8B) {
		return HoldEncodingType.Gzip;
	} else {
		return HoldEncodingType.DeflateXor;
	}
}

let lastSleep = 0;
function shouldYieldToUi() {
	if (lastSleep === 0) {
		lastSleep = Date.now();
	}

	return lastSleep + Constants.xmlReaderFrameDuration < Date.now();
}
async function yieldToUi() {
	await new Promise(resolve => setTimeout(resolve, Constants.xmlReaderSleep));
}