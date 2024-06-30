import { assertNotNull } from "../utils/Asserts";
import { SignalString } from "../utils/SignalString";
import { AsyncUnzlib, FlateError } from 'fflate';
import { truncate } from "../utils/StringUtils";
import { SignalArray } from "../utils/SignalArray";
import { holdXmlToObject } from "../data/HoldXmlToObject";
import { Signal } from "../utils/Signals";
import { Hold } from "../data/datatypes/Hold";

interface HoldReaderState {
	file?: File;
	holdBinaryData?: Uint8Array;
	holdXmlText?: string;
	holdXml?: XMLDocument;
	hold?: Hold;
}

const MAX_STEP_TIME = 30;

type HoldReaderStep = () => boolean | void;
type HoldFileSource = { file: File }
	| { xmlString: string }

export class HoldReader {
	public readonly id: number;

	public error?: string;

	public readonly sharedState: HoldReaderState;
	private readonly _steps: HoldReaderStep[];

	private _currentStepIndex = 0;

	public logs = new SignalArray<string>();
	public name = new SignalString();

	public onParsed = new Signal<HoldReader>();

	public get isFinished() {
		return !!this.error || this._currentStepIndex === this._steps.length;
	}

	public constructor(id: number, source: HoldFileSource) {
		this.id = id;

		this.logs.push("Initialized.");
		this._currentStepIndex = 0;

		this.sharedState = {}

		if ('file' in source) {
			this.sharedState.file = source.file;

			this._steps = [
				...getReadFileStep(this),
				...getDecodeHoldStep(this),
				...getUnpackHoldStep(this),
				...getHoldBinaryToTextStep(this),
				...getStringXmlToObjectStep(this),
				...getXmlToData(this)
			];

			this.name.value = `${truncate(source.file.name, 32)} (1 / ${this._steps.length})`;
		} else {
			this.sharedState.holdXmlText = source.xmlString;

			this._steps = [
				...getStringXmlToObjectStep(this),
				...getXmlToData(this)
			];

			this.name.value = `${truncate(this.id, 32)} (1 / ${this._steps.length})`;
		}


	}

	public update() {
		if (this._currentStepIndex >= this._steps.length) {
			return;
		}

		const baseName = this.sharedState.file?.name ?? this.id;

		try {
			const result = this._steps[this._currentStepIndex]();

			if (result !== false) {
				this._currentStepIndex++;

				if (this._currentStepIndex === this._steps.length) {
					if (this.sharedState.hold) {
						this.name.value = truncate(this.sharedState.hold.name.text, 32);
						this.onParsed.dispatch(this);

					} else {
						this.name.value = `${truncate(baseName, 26)} Error!`;
					}

				} else {
					this.name.value = `${truncate(baseName, 32)} (${this._currentStepIndex + 1} / ${this._steps.length})`;
				}
			}
		} catch (e) {
			this.error = e instanceof Error ? e.message : String(e);
			this._currentStepIndex = this._steps.length;

			this.name.value = `${truncate(baseName, 26)} Error!`;
		}
	}
}

function getReadFileStep(reader: HoldReader): HoldReaderStep[] {
	let isFinished = false;
	const fileReader = new FileReader();

	const onProgress = (e: ProgressEvent) => {
		const percent = (e.loaded / e.total) * 100;
		reader.logs.push(`Reading file ${percent.toFixed(2)}%`);
	};

	const onError = () => {
		throw new Error("Error occurred while reading the file.");
	}

	const onLoad = () => {
		const { result } = fileReader;

		if (result instanceof ArrayBuffer) {
			reader.sharedState.holdBinaryData = new Uint8Array(result);
			isFinished = true;
			reader.logs.push(`Reading file finished!`);

		} else if (typeof result === 'string') {
			throw new Error("Error occurred while reading the file - got string as a response instead of an array buffer."
				+ " This is a problem with the code, it shouldn't happen!"
			);
		} else {
			throw new Error("Error occurred while reading the file - operation finished but no data is available");
		}
	}

	return [
		() => {
			fileReader.addEventListener('progress', onProgress);
			fileReader.addEventListener('error', onError);
			fileReader.addEventListener('load', onLoad);
		},
		() => {
			const { file } = reader.sharedState;

			assertNotNull(file, "Reading file error - no file given");

			fileReader.readAsArrayBuffer(file)
		},
		() => isFinished
	];
}

function getDecodeHoldStep(reader: HoldReader): HoldReaderStep[] {
	let index = 0;
	let total = 0;
	let bytesPerTick = 1024 * 1024;
	let lastDuration = -1;

	return [
		() => {
			const { holdBinaryData } = reader.sharedState;

			assertNotNull(holdBinaryData, "Decoding hold error - missing binary data");

			total = holdBinaryData.length;

			if (total === 0) {
				throw new Error("Decoding hold error - data is empty")
			}
		},
		() => {
			const { holdBinaryData } = reader.sharedState;

			assertNotNull(holdBinaryData, "Decoding hold error - missing binary data");

			if (lastDuration < 5) {
				bytesPerTick *= 10;
			} else if (lastDuration >= 5) {
				bytesPerTick = bytesPerTick * MAX_STEP_TIME / lastDuration
			}

			const to = Math.min(total, index + bytesPerTick);
			const timeStart = Date.now();
			for (; index < to; index++) {
				holdBinaryData[index] = holdBinaryData[index] ^ 0xFF;
			}
			lastDuration = Date.now() - timeStart;

			const percent = (index / total) * 100;
			reader.logs.push(`Decoding hold file ${percent.toFixed(2)}%`)

			return index === total;
		}
	]
}

function getUnpackHoldStep(reader: HoldReader) {
	let isFinished = false;
	let compressedSize = 0;
	let error: Error | undefined;

	const unzlib = new AsyncUnzlib();

	const onData = (flateError: FlateError | null, data: Uint8Array, final: boolean) => {
		if (flateError) {
			unzlib.terminate();
			isFinished = true;
			error = flateError;
			return;
		}

		if (!final) {
			console.log("Not final");
			return;
		}

		isFinished = true;

		reader.sharedState.holdBinaryData = data;
		reader.logs.push("Hold inflated.");
	}
	const onDrain = (size: number) => {
		const percent = (size / compressedSize) * 100;
		reader.logs.push(`Inflating hold ${percent.toFixed(2)}%`);
	}

	return [
		() => unzlib.ondata = onData,
		() => unzlib.ondrain = onDrain,
		() => reader.logs.push("Inflating hold..."),
		() => {
			const { holdBinaryData } = reader.sharedState;

			assertNotNull(holdBinaryData, "Decoding hold error - missing binary data");

			compressedSize = holdBinaryData.length;
			unzlib.push(holdBinaryData, true);
		},
		() => isFinished,
		() => {
			if (error) {
				throw error;
			}
		}
	];
}

function getHoldBinaryToTextStep(reader: HoldReader) {
	let index = 0;
	let total = 0;
	let holdXmlText = "";

	let bytesPerTick = 1024 * 1024;
	let lastDuration = -1;

	return [
		() => {
			const { holdBinaryData } = reader.sharedState;

			assertNotNull(holdBinaryData, "Converting hold to text error - missing binary data");

			total = holdBinaryData.length;
		},
		() => {
			const { holdBinaryData } = reader.sharedState;

			assertNotNull(holdBinaryData, "Converting hold to text error - missing binary data");

			if (lastDuration < 5) {
				bytesPerTick *= 10;
			} else if (lastDuration >= 5) {
				bytesPerTick = bytesPerTick * MAX_STEP_TIME / lastDuration
			}

			const to = Math.min(total, index + bytesPerTick);
			const timeStart = Date.now();
			holdXmlText += (new TextDecoder().decode(holdBinaryData.slice(index, to)));
			index = to;
			lastDuration = Date.now() - timeStart;

			const percent = (index / total) * 100;
			reader.logs.push(`Converting hold to text file ${percent.toFixed(2)}%`)

			return index === total;
		},
		() => {
			reader.sharedState.holdXmlText = holdXmlText;
		}
	]
}

function getStringXmlToObjectStep(reader: HoldReader) {
	return [
		() => {
			const { holdXmlText } = reader.sharedState;

			assertNotNull(holdXmlText, "String to XML error - missing text data");

			reader.logs.push('Reading XML');

			const parser = new DOMParser();
			reader.sharedState.holdXml = parser.parseFromString(holdXmlText, "text/xml");
		}
	]
}

function getXmlToData(reader: HoldReader) {
	let isFinished = false;
	let error: Error | undefined;

	return [
		() => {
			const { holdXml } = reader.sharedState;

			assertNotNull(holdXml, "XML To Data - missing XML Object");

			reader.logs.push('Parsing XML');

			holdXmlToObject(holdXml, log => reader.logs.push(log))
				.then(hold => {
					reader.sharedState.hold = hold;
					isFinished = true;
					reader.logs.push("FINISHED");
				})
				.catch(e => {
					error = e;
					console.error(e);
				});
		},
		() => isFinished,
		() => {
			if (error) {
				throw error;
			}
		}
	]
}