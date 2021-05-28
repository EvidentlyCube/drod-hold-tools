import {createNullHold} from "../data/Hold";
import {DecodeState, DecodeStep} from "./DecoderCommon";
import {getDecoderReadFile} from "./DecodeReadFile";
import {getDecodeXor} from "./DecodeXor";
import {getDecodeInflate} from "./DecodeInflate";
import {getDecodeReadToXml} from "./DecodeReadToXml";
import {Signal} from "signals";
import {getDecodeToHold} from "./DecodeToHold";
import {Store} from "../data/Store";
import {getDecodeHoldLinker} from "./DecodeHoldLinker";

const MAX_TIME_PER_TICK = 8;

export class HoldDecoder {
	private _state: DecodeState;
	private _steps: DecodeStep[];
	private _fileName: string;

	public onUpdate: Signal;

	public get isLoading() {
		return this._steps.length > 0;
	}

	public get currentStep(): DecodeStep | undefined {
		return this._steps[0];
	}

	public get progressFactor() {
		return this._state.progressFactor;
	}

	public get fileName() {
		return this._fileName;
	}

	public get hold() {
		return this._state.hold;
	}

	constructor() {
		this._state = undefined!;
		this._steps = [];
		this._fileName = "";
		this.onUpdate = new Signal();
	}

	public startDecode(file: File) {
		this._fileName = file.name;

		this._steps = [
			getDecoderReadFile(),
			getDecodeXor(),
			getDecodeInflate(),
			getDecodeReadToXml(),
			getDecodeToHold(),
			getDecodeHoldLinker()
		];

		this._state = {
			file,
			holdBytes: new Uint8Array(),
			holdXml: document.implementation.createDocument(null, null),
			hold: createNullHold(),
			progressFactor: 0,
		};

		requestAnimationFrame(() => this.update());
	}

	private update() {
		const readUntil = Date.now() + MAX_TIME_PER_TICK;

		while (Date.now() < readUntil) {
			const step = this._steps[0];

			if (!step) {
				break;
			}

			if (step.run(this._state)) {
				step.after?.(this._state);
				this._steps.shift();
			}
		}

		this.onUpdate.dispatch();

		if (this._steps.length) {
			requestAnimationFrame(() => this.update());
		} else {
			Store.loadedHold.value = this._state.hold;
		}
	}
}